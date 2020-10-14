import { Vue } from '@/core/Vue'
import computedPlugin from '@/plugins/computed';

Vue.use(computedPlugin)

new Vue({
  data() {
    return {
      count: 0
    }
  },
  computed: {
    evenOrOdd() {
      return this.count % 2 === 0 ? 'even' : 'odd'
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
  },
  render(h: Function) {
    const { count, evenOrOdd, increment, decrement } = this
    return h(
      'div', [
      h('p', `Clicked: ${count} times, count is ${evenOrOdd}.`),
      h('button', { on: { click: increment } }, '+'),
      h('button', { on: { click: decrement } }, '-'),
    ]
    )
  },
  beforeCreate() {
    console.log('beforeCreate');
  },
  created() {
    console.log('created');
  }
})
  .$mount('#app')
