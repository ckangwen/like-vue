import { Vue } from '@/core/Vue'

const Comp = Vue.extend({
  data() {
    return {
      text: 'hello'
    }
  },
  render(h: Function) {
    const { text } = this
    return (
      h('span', text)
    )
  }
})

const vm = new Comp()
vm.$mount('#app')