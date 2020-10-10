import { Vue } from '@/core/Vue'
import Vuex from '@/plugins/vuex'

Vue.use(Vuex)

type CountState = {
  count: number
}

const state = {
  count: 0
}
const getters = {
  evenOrOdd: (state: CountState) => state.count % 2 === 0 ? 'even' : 'odd'
}
const mutations = {
  increment(state: CountState) {
    state.count++
  },
  decrement(state: CountState) {
    state.count--
  }
}
const actions = {
  incrementIfOdd({ commit, state }: any) {
    if ((state.count + 1) % 2 === 0) {
      commit('increment')
    }
  },
  incrementAsync({ commit }: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('increment')
        resolve()
      }, 1000)
    })
  }
}

type NameState = {
  firstName: string
  lastName: string
}
const module = {
  namespaced: true,
  state: {
    firstName: 'tom',
    lastName: ' james'
  },
  getters: {
    fullName({ firstName, lastName }: NameState) {
      return firstName + ' ' + lastName
    }
  },
  mutations: {
    changeFirstName(state: NameState) {
      state.firstName = state.firstName + ' D '
    }
  }
}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: { user: module }
})


const vm = new Vue({
  store,
  data() {
    return {
      text: 'text'
    }
  },
  methods: {
    increment(this: any) {
      this.$store.commit('increment')
    },
    decrement(this: any) {
      this.$store.commit('decrement')
    },
    incrementIfOdd(this: any) {
      this.$store.dispatch('incrementIfOdd')
    },
    incrementAsync(this: any) {
      this.$store.dispatch('incrementAsync')
    },
  },
  render(this: any, h: Function) {
    const { increment, decrement, incrementIfOdd, incrementAsync  } = this
    const { state, getters } = this.$store
    // TODO 第二次点击后，getters.evenOrOdd没有发生变化
    return h(
      'div', { attrs: { id: 'app' } }, [
        h('p', `Clicked ${state.count} times, count is ${getters.evenOrOdd}`),
        h('button', { on: { click: increment } }, 'increment'),
        h('button', { on: { click: decrement } }, 'decrement'),
        h('button', { on: { click: incrementIfOdd } }, 'incrementIfOdd'),
        h('button', { on: { click: incrementAsync } }, 'incrementAsync'),
      ]
    )
  }
}).$mount('#app')
