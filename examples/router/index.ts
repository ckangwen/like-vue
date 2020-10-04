import { VueRouter } from '../../src/plugins/vue-router/VueRouter';

const router = new VueRouter({
  base: '/',
  routes: [
    {
      path: '/',
      name: 'home',
      component: {},
      alias: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: {},
      alias: '/login'
    },
  ]
})

router.init()

router.history.push({ path: '/login' })
