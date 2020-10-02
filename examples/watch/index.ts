import { Vue } from '@/core/Vue'
import watchPlugin from '@/plugins/watch'
Vue.use(watchPlugin)

new Vue({
  data() {
    return {
      text: 'text'
    }
  },
  methods: {
    changeText() {
      this.text = this.text + '!!'
    }
  },
  watch: {
    // text(val: any, oldVal: any) {
    //   console.log(val, oldVal);
    // }
    text: {
      handler(val: any, oldVal: any) {
        console.log(val, oldVal);
      },
      immediate: true
    }
  },
  render(this: any, h: Function) {
    const { text, changeText } = this

    return h(
      'div', {}, [
        h('p', {}, [text]),
        h('button', { on: { click: changeText } }, 'changeText'),
      ]
    )
  }
})
  .$mount('#app')
