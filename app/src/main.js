import '@babel/polyfill';
import Vue from 'vue';
import vuetify from './plugins/vuetify';
import './plugins/color';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Storage from 'vue-ls';

Vue.use(VueAxios, axios);
Vue.use(Storage, {
  namespace: 'digipiggy__',
  name: 'ls',
  storage: 'local'
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
