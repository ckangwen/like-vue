import { Vue } from '@/core/Vue'
import { __DEV__ } from '@/shared'
import componentsPlugin from '@/plugins/components'

Vue.use(componentsPlugin)

Vue.component('hello-text', {
  data() {
    return {
      text: 'hello'
    }
  },
  render(h: Function) {
    const { text } = this
    return (
      h('p', text)
    )
  }
})


new Vue({
  data() {
    return {
      text: 'text'
    }
  },
  props: {
    some: String
  },
  render(this: any, h: Function) {
    const { text } = this
    return h(
      'div', {}, [
      h('hello-text'),
      text
    ]
    )
  }
})
  .$mount('#app')
