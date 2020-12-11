import Vue from 'vue';
import Router from 'vue-router';
import Auth from './auth';
import Setup from './views/Setup';
import Callback from './views/Callback';
import PigDashboard from './views/PigDashboard';
import PigSettings from './views/PigSettings';
import Home from './views/Home';
import Story from './views/Story';
import Chapter from './views/Chapter';

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
      path: '/pigDashboard',
      name: 'pigDashboard',
      component: PigDashboard
    },
    {
      path: '/pigSettings',
      name: 'pigSettings',
      component: PigSettings
    },
    {
      path: '/story',
      name: 'story',
      component: Story
    },
    {
      path: '/chapter',
      name: 'chapter',
      component: Chapter
    },
    {
      path: '*',
      redirect: { name: 'pigDashboard' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path === '/setup' || to.path === '/callback' || Auth.isAuthenticated()) {
    next();
  } else {
    Auth.login();
  }
});

export default router;