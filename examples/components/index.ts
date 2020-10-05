import { Vue } from '@/core/Vue'
import { __DEV__ } from '@/shared'
import componentsPlugin from '@/plugins/components'

Vue.use(componentsPlugin)

Vue.component('hello-text', {
  props: {
    text: String
  },
  render(h: Function) {
    const { text = 'defaultText' } = this
    return (
      h('p', text)
    )
  }
})


new Vue({
  data() {
    return {
      text: 'text from parent data'
    }
  },
  methods: {
    changeText() {
      this.text = this.text + '--'
    }
  },
  render(this: any, h: Function) {
    const { text, changeText } = this
    return h(
      'div', {}, [
      h('hello-text', { attrs: { text } }),
      h('button', { on: { click: changeText } }, '改变text')
    ]
    )
  }
})
  .$mount('#app')
