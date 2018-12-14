import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'https://digipiggybank.com' : '';
const cloneDevice = device => JSON.parse(JSON.stringify(device));

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: {
      text: null,
      color: null
    },
    device: {
      deviceId: null,
      buckets: [],
      data: []
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
    initialize({ commit, dispatch }) {
      const device = Vue.ls.get('device');
      if (device) {
        commit('setDevice', device);
        dispatch('loadDevice', device.deviceId);
      }
    },
    displayMessage({ commit }, options) {
      commit('setMessage', options);
      setTimeout(() => commit('setMessage', { text: null, color: null }), 0);
    },
    async loadDevice({ commit }, deviceId) {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/device/${deviceId}`);
        Vue.ls.set('device', response.data);
        commit('setDevice', response.data);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async storeDevice({ commit }, device) {
      try {
        await axios.put(`${apiBaseUrl}/api/device/${device.deviceId}`, device);
        Vue.ls.set('device', device);
        commit('setDevice', device);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async updateBucketTotals({ state, commit }, deposits) {
      const updatedDevice = cloneDevice(state.device);
      updatedDevice.data.forEach((d, i) => d.current += deposits[i]);

      try {
        await axios.put(`${apiBaseUrl}/api/device/${updatedDevice.deviceId}`, updatedDevice);
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
