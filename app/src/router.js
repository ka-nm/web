import Vue from 'vue'
import Router from 'vue-router'
import Device from './views/Device.vue'
import Home from './views/Home.vue'
import Setup from './views/Setup.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/device',
      name: 'device',
      component: Device
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/setup',
      name: 'setup',
      component: Setup
    }
  ]
});

router.beforeEach((to, from, next) => {
  const deviceId = Vue.ls.get('deviceId');
  if (to.path === '/device') {
    return deviceId ? next('/') : next();
  }

  if (deviceId) {
    return next();
  }

  next('/device');
});

export default router;