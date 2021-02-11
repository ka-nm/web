import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import https from 'https';
import qs from 'qs';
import Auth from './auth';
import chapters from './chapters'

const cloneDevice = device => JSON.parse(JSON.stringify(device));
const coalesce = (total, value) => total > 0 ? (value / total).toFixed(2) : '0.00';

const httpsAgent = new https.Agent({
  maxVersion: "TLSv1.3",
  minVersion: "TLSv1.2"
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseUrl: process.env.VUE_APP_API_BASE_URL || '',
    message: {
      text: null,
      color: null
    },
    device: {
      deviceId: null,
      deviceCode: null,
      goals: []
    },
    chapters
  },
  mutations: {
    setMessage(state, options) {
      state.message.text = options.text;
      state.message.color = options.color;
    },
    setDevice(state, device) {
      state.device = device;
    }
  },
  getters: {
    promises: state => {
      return state.device.goals.reduce((acc, cur) => {
        if (cur.promises) {
          return acc.concat(cur.promises.map((item) => {
            return {
              goalName: cur.name,
              activity: item.activity,
              amount: item.amount
            }
          }));
        }
        return acc;
      }, []);
    },
  },
  actions: {
    displayMessage({ commit }, options) {
      commit('setMessage', options);
      setTimeout(() => commit('setMessage', { text: null, color: null }), 0);
    },
    async loadDevice({ state, commit }, deviceId) {
      try {
        const response = await axios.get(`${state.baseUrl}/api/device/${deviceId}`, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        }, httpsAgent);

        Vue.ls.set('device', response.data);
        commit('setDevice', response.data);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async updateDevice({ state, dispatch, commit }, device) {
      const toggles = device.goals.map(g => g.enabled);
      if (!await dispatch('updateEnabled', toggles)) {
        return false;
      }

      const colors = device.goals.map(g => g.color);
      if (!await dispatch('updateColors', colors)) {
        return false;
      }

      const piggySleep = device.piggySleep;
      if (!await dispatch('updatePiggySleep', piggySleep)) {
        return false;
      }

      const values = device.goals.map(g => {
        return {
          total: g.total,
          current: g.current,
          promise: g.promise
        };
      });

      if (!await dispatch('updateValues', values)) {
        return false;
      }

      try {
        await axios.put(`${state.baseUrl}/api/device/${state.device.deviceId}`, device, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        }, httpsAgent);

      } catch (err) {
        console.error(err);
        return false;
      }

      Vue.ls.set('device', device);
      commit('setDevice', device);
      return true;
    },
    async resetDevice({ state }) {
      const response = await axios.post(`https://api.particle.io/v1/devices/${state.device.deviceId}/reset`,
        qs.stringify({
          arg: ''
        }), {
          headers: { Authorization: `Bearer ${Auth.accessToken}` }
        }, httpsAgent);

      if (!response.data.connected || response.data.return_value !== 0) {
        return false;
      }

      const updatedDevice = cloneDevice(state.device);
      updatedDevice.goals.forEach(g => {
        g.enabled = false;
        g.total = 0;
        g.current = 0;
        g.promise = 0;
        g.promises = [];
      });

      try {
        await axios.put(`${state.baseUrl}/api/device/${state.device.deviceId}`, updatedDevice, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        }, httpsAgent);
      } catch (err) {
        console.error(err);
        return false;
      }

      return true;
    },
    async updateEnabled({ state, commit }, toggles) {
      try {
        const response = await axios.post(`https://api.particle.io/v1/devices/${state.device.deviceId}/toggle`,
          qs.stringify({
            arg: toggles.map(t => t ? 1 : 0).join('|')
          }), {
            headers: { Authorization: `Bearer ${Auth.accessToken}` }
          }, httpsAgent);

        if (!response.data.connected || response.data.return_value !== 0) {
          return false;
        }

        const updatedDevice = cloneDevice(state.device);
        updatedDevice.goals.forEach((d, i) => d.enabled = toggles[i]);
        Vue.ls.set('device', updatedDevice);
        commit('setDevice', updatedDevice);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async updateValues({ state, commit }, values) {
      try {
        const response = await axios.post(`https://api.particle.io/v1/devices/${state.device.deviceId}/update`,
          qs.stringify({
            arg: values.map(v => `${coalesce(v.total, v.current)},${coalesce(v.total, v.promise)}`).join('|')
          }), {
            headers: { Authorization: `Bearer ${Auth.accessToken}` }
          }, httpsAgent);

        if (!response.data.connected || response.data.return_value !== 0) {
          return false;
        }

        const updatedDevice = cloneDevice(state.device);
        updatedDevice.goals.forEach((g, i) => {
          g.total = values[i].total,
            g.current = values[i].current,
            g.promise = values[i].promise
        });

        Vue.ls.set('device', updatedDevice);
        commit('setDevice', updatedDevice);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async updateColors({ state, commit }, colors) {
      try {
        const response = await axios.post(`https://api.particle.io/v1/devices/${state.device.deviceId}/color`,
          qs.stringify({
            arg: colors.join('|')
          }), {
            headers: { Authorization: `Bearer ${Auth.accessToken}` }
          }, httpsAgent);

        if (!response.data.connected || response.data.return_value !== 0) {
          return false;
        }

        const updatedDevice = cloneDevice(state.device);
        updatedDevice.goals.forEach((g, i) => g.color = colors[i]);
        Vue.ls.set('device', updatedDevice);
        commit('setDevice', updatedDevice);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async depositIntoGoals({ state, dispatch }, amount) {
      const deposits = [0, 0, 0, 0];
      let remainder = amount;
      do {
        remainder = state.device.goals.reduce((r, g, i) => {
          //use original remainder to make sure percents are calculated accurately.
          let deposit = Math.round(g.percentage * remainder);

          //if deposit is calculated to zero ( like 25% of $3), set deposit to the running remainder
          //if deposit is more then running remainder, set deposit to the running remainder
          if (r > 0 && (deposit === 0 || r < deposit)) {
            deposit = r;
          }

          //if the goal has been reached, skip it.
          //if the goal is disabled, skip it.
          //if the remainder is zero, skip the goal.
          if (r > 0 && g.enabled && g.total > g.current + deposits[i]) {
            const runningTotal = g.current + deposits[i];
            //if the deposit is more than the goal total, calculate the diff and deposit that.
            if (runningTotal + deposit > g.total) {
              const diff = g.total - runningTotal;
              deposits[i] += diff;
              r -= diff;
            } else {
              deposits[i] += deposit;
              r -= deposit;
            }
          }

          return r;
        }, remainder);
        //keep looping until money is gone or all goals are met.
      } while (remainder > 0 && !state.device.goals.every((d, i) => d.total === d.current + deposits[i]));

      const values = state.device.goals.map((g, i) => {
        return {
          total: g.total,
          current: g.current + deposits[i],
          promise: g.promise
        };
      });

      if (!await dispatch('updateValues', values)) {
        return false;
      }

      const updatedDevice = cloneDevice(state.device);
      try {
        await axios.put(`${state.baseUrl}/api/device/${state.device.deviceId}`, updatedDevice, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        }, httpsAgent);
      } catch (err) {
        console.error(err);
        return false;
      }

      return true;
    },
    async addPromise({state, dispatch}, promise) {
      const updatedDevice = cloneDevice(state.device);

      updatedDevice.goals.forEach((item) => {
        if (item.name === promise.goalName) {
          if (!item.promises || !Array.isArray(item.promises)) {
            item.promises = [];
          }

          item.promises.push({
            activity: promise.activity,
            amount: +promise.amount
          });

          item.promise = item.promises.reduce((acc, cur) => {
            return acc + cur.amount;
          }, 0);
        }
      });

      return await dispatch('updateDevice', updatedDevice);
    },
    async removePromise({state, dispatch}, promise) {
      const updatedDevice = cloneDevice(state.device);

      updatedDevice.goals.forEach((goal) => {
        if (goal.name === promise.goalName) {
          const foundIndex = goal.promises.findIndex((curPromise) => {
            return curPromise.action === promise.activatable &&
                   curPromise.amount === promise.amount
          });

          goal.promises.splice(foundIndex, 1);

          goal.promise = goal.promises.reduce((acc, cur) => {
            return acc + cur.amount;
          }, 0);
        }
      });

      return await dispatch('updateDevice', updatedDevice);
    },
    async completePromise({state, dispatch}, promise) {
      const updatedDevice = cloneDevice(state.device);

      updatedDevice.goals.forEach((goal) => {
        if (goal.name === promise.goalName) {
          const foundIndex = goal.promises.findIndex((curPromise) => {
            return curPromise.action === promise.activatable &&
                curPromise.amount === promise.amount
          });

          goal.current = goal.current + goal.promises[foundIndex].amount;
          goal.promises.splice(foundIndex, 1);
          goal.promise = goal.promises.reduce((acc, cur) => {
            return acc + cur.amount;
          }, 0);
        }
      });


      return await dispatch('updateDevice', updatedDevice);
    },
    async saveAllowance({state, dispatch}, allowance) {
      const updatedDevice = cloneDevice(state.device);

      updatedDevice.allowance = allowance;

      return await dispatch('updateDevice', updatedDevice);
    },
    async savePiggySleep({state, dispatch}, piggySleep) {
      const updatedDevice = cloneDevice(state.device);
      updatedDevice.piggySleep = piggySleep;
      return await dispatch('updateDevice', updatedDevice);
    },
    async updatePiggySleep({state, commit}, piggySleep){
      let payload = null;
      if (!piggySleep) {
        payload = '0|00:00|00:00|0|0';
      } else {
        payload = `${piggySleep.enabled ? 1 : 0}|${piggySleep.wakeupTime || '00:00'}|${piggySleep.sleepTime || '00:00'}|${piggySleep.timezone || 0}|${piggySleep.observeDaylightSavings ? 1 : 0}`
      }

      try {
        const response = await axios.post(`https://api.particle.io/v1/devices/${state.device.deviceId}/piggysleep`,
            {arg: payload}, {
              headers: { Authorization: `Bearer ${Auth.accessToken}` }
            }, httpsAgent);

        if (!response.data.connected || response.data.return_value !== 0) {
          return false;
        }

        const updatedDevice = cloneDevice(state.device);
        updatedDevice.piggySleep = piggySleep;

        Vue.ls.set('device', updatedDevice);
        commit('setDevice', updatedDevice);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
  }
})
