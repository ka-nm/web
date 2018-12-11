import Vue from 'vue'
import Vuex from 'vuex'

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
      state.device.deviceId = device.deviceId;
    }
  },
  actions: {
    displayMessage({ commit }, text) {
      commit('setMessage', text);
      setTimeout(() => commit('setMessage', null), 0);
    },
    storeDevice({ commit }, device) {
      Vue.ls.set('deviceId', device.deviceId);
      commit('setDevice', {
        deviceId: device.deviceId,
        buckets: device.buckets.slice(0),
        data: device.data.slice(0)
      });
    }
  }
})