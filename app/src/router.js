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
  const device = Vue.ls.get('device');
  if (to.path === '/device') {
    return device ? next('/') : next();
  }

  if (device) {
    return next();
  }

  next('/device');
});

export default router;