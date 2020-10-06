import { Vue } from '@/core/Vue'
import { VueRouter } from '../../src/plugins/router/VueRouter'
import VueRouterPlugin from '@/plugins/router'
import componentsPlugin from '@/plugins/components'

Vue.use(componentsPlugin)
Vue.use(VueRouterPlugin)

const Home = {
  name: 'Home',
  data() {
    return {}
  },
  methods: {
    onClick(this: any) {
      this.$router.push('/login')
      console.log(this.$router);
    }
  },
  render(this: any, h: Function) {
    const { onClick } = this
    return h('div', [
      h('h1', 'Home'),
      h('button', { on: { click: onClick } }, '跳转到login')
    ])
  }
}
const Login = {
  name: 'login',
  data() {
    return {}
  },
  methods: {
    onClick(this: any) {
      this.$router.push('/')
    }
  },
  render(this: any, h: Function) {
    const { onClick } = this
    return h('div', [
      h('h1', 'Login'),
      h('button', { on: { click: onClick } }, '跳转到home')
    ])
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
