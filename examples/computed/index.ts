import { Vue } from '@/core/Vue'
import computedPlugin from '@/plugins/computed'
Vue.use(computedPlugin)

new Vue({
  data() {
    return {
      text: 'text'
    }
  },
  computed: {
    computedText() {
      return '??' + this.text + '??'
    }
  },
  methods: {
    changeText() {
      this.text = this.text + '!!'
    }
  },
  render(this: any, h: Function) {
    const { text, computedText, changeText } = this

    return h(
      'div', {}, [
        h('p', {}, [computedText]),
        h('p', {}, [text]),
        h('button', { on: { click: changeText } }, 'changeText'),
      ]
    )
  }
})
  .$mount('#app')
