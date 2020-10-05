import { Vue } from '@/core/Vue'

Vue.mixin({
  beforeCreate() {
    console.log('beforeCreate in Vue.mixin');
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
      'div', {}, [text]
    )
  },
  beforeCreate() {
    console.log('beforeCreate in Instance');
  }
})
.$mount('#app')
