import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'https://web-f6sfhikn4.now.sh' : '';
const cloneState = device => {
  return {
    deviceId: device.deviceId,
    buckets: device.buckets.slice(0),
    data: device.data.slice(0)
  };
}

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: null,
    device: {
      deviceId: null,
      buckets: [],
      data: []
    }
  },
  mutations: {
    setMessage(state, text) {
      state.message = text;
    },
    setDevice(state, device) {
      state.device = device;
    }
  },
  actions: {
    initialize({ dispatch }) {
      const device = Vue.ls.get('device');
      if (device) {
        dispatch('loadDevice', device.deviceId);
      }
    },
    displayMessage({ commit }, text) {
      commit('setMessage', text);
      setTimeout(() => commit('setMessage', null), 0);
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
    async updateBucketTotals({ state, commit }, deposits) {
      const updatedDevice = cloneState(state.device);
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
