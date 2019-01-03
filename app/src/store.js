import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import qs from 'qs';
import Auth from './auth';

const cloneDevice = device => JSON.parse(JSON.stringify(device));
const coalesce = (total, value) => total > 0 ? (value / total).toFixed(2) : '0.00';

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
    }
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
  actions: {
    displayMessage({ commit }, options) {
      commit('setMessage', options);
      setTimeout(() => commit('setMessage', { text: null, color: null }), 0);
    },
    async loadDevice({ state, commit }, deviceId) {
      try {
        const response = await axios.get(`${state.baseUrl}/api/device/${deviceId}`, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        });

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
        });

      } catch (err) {
        console.error(err);
        return false;
      }

      Vue.ls.set('device', device);
      commit('setDevice', device);
      return true;
    },
    async resetDevice({ state, dispatch }) {
      if (!await dispatch('updateEnabled', [false, false, false, false])) {
        return false;
      }

      const values = Array(4).fill().map(() => {
        return {
          total: 0,
          current: 0,
          promise: 0
        };
      });

      if (!await dispatch('updateValues', values)) {
        return false;
      }

      const updatedDevice = cloneDevice(state.device);
      updatedDevice.goals.forEach(g => {
        g.total = 0;
        g.current = 0;
        g.promise = 0;
      });

      try {
        await axios.put(`${state.baseUrl}/api/device/${state.device.deviceId}`, updatedDevice, {
          headers: { Authorization: `Bearer ${Auth.idToken}` }
        });

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
          });

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
          });

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
          });

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
          if (g.enabled && g.total > g.current + deposits[i]) {
            const deposit = Math.round(g.percentage * remainder);
            const runningTotal = g.current + deposits[i];
            if (runningTotal + deposit > g.total) {
              const diff = g.total - runningTotal;
              deposits[i] += diff;
              r += deposit - diff;
            } else {
              deposits[i] += deposit;
            }
          }

          return r;
        }, 0);
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
      updatedDevice.goals.forEach((g, i) => g.current += deposits[i]);
      try {
        await axios.put(`${state.baseUrl}/api/device/${state.device.deviceId}`, updatedDevice);
      } catch (err) {
        console.error(err);
        return false;
      }

      return true;
    }
  }
})