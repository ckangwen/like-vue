import { Vue } from '@/core/Vue'
import { VueRouter } from '../../src/plugins/router/VueRouter'
import VueRouterPlugin from '@/plugins/router'
import componentsPlugin from '@/plugins/components'

Vue.use(componentsPlugin)

const Home = {
  name: 'Home',
  data() {
    return {}
  },
  render(h: Function) {
    return h('h1', 'Home')
  }
}
const Login = {
  name: 'login',
  data() {
    return {}
  },
  render(h: Function) {
    return h('h1', 'Login')
  }
}

const router = new VueRouter({
  base: '/',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      alias: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      alias: '/login'
    },
  ]
})

Vue.use(VueRouterPlugin)

const vm = new Vue({
  router,
  data() {
    return {
      text: 'text'
    }
  },
  props: {
    some: String
  },
  render(this: any, h: Function) {
    const { text, onClick } = this
    return h(
      'div', {}, [
        h('router-view'),
        text
      ]
    )
  }
})

vm.$mount('#app')
