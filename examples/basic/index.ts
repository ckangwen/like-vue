import { Vue } from '@/core/Vue'

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
      'div', {}, [text]
    )
  },
  beforeCreate() {
    console.log(11);
  },
  created() {
    console.log(3333);
  }
})
.$mount('#app')
