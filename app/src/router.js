import Vue from 'vue'
import Router from 'vue-router'
import Device from './views/Device.vue'
import Setup from './views/Setup.vue'
import Home from './views/Home.vue'
import Settings from './views/Settings.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/device',
      name: 'device',
      component: Device
    },
    {
      path: '/setup',
      name: 'setup',
      component: Setup
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path === '/setup') {
    return next();
  }

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