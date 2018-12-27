import Vue from 'vue';
import Router from 'vue-router';
import Auth from './auth';
import Setup from './views/Setup';
import Callback from './views/Callback';
import Home from './views/Home';
import Settings from './views/Settings';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/setup',
      name: 'setup',
      component: Setup
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
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
    },
    {
      path: '*',
      redirect: { name: 'home' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path === '/setup' || to.path === '/callback' || Auth.isAuthenticated()) {
    return next();
  }

  Auth.login();
});

export default router;