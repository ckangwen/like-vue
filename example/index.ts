import { Vue } from '@/core'

new Vue({
  data() {
    return {
      text: 'text'
    }
  },
  render(this: any, h: Function) {
    const { text } = this
    return h(
      'div', {}, [text]
    )
  }
})
.$mount('#app')
