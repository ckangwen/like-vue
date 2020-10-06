import { Vue } from '@/core/Vue'
import { __DEV__ } from '@/shared'
import componentsPlugin from '@/plugins/components'

Vue.use(componentsPlugin)

Vue.component('hello-text', {
  props: {
    text: String
  },
  methods: {
    clickToEmit(this: any) {
      console.log('子组件触发click事件');
      this.$emit('test')
    }
  },
  render(h: Function) {
    const { text = 'defaultText', clickToEmit, $slots } = this
    console.log($slots);
    return (
      h('div', [
        ...($slots.header ? $slots.header : []),
        h('p', text),
        h('p', { on: { click: clickToEmit } }, '点击向上传递test事件'),
        ...$slots.default
      ])
    )
  }
})

Vue.component('functional', {
  functional: true,
  props: {
    name: String
  },
  render(h: any, context: any) {
    const { name } = context.props
    return h('p', `functional-component, name is ${name}`)
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
    },
    testHandler() {
      console.log('test事件在父组件触发');
    }
  },
  render(this: any, h: Function) {
    const { text, changeText, testHandler } = this
    return h(
      'div', {}, [
      h('hello-text', { attrs: { text }, on: { test: testHandler } }, [
        h('p', '默认插槽'),
        h('p', { slot: 'header' }, '具名插槽'),
      ]),
      h('button', { on: { click: changeText } }, '改变text'),
      h('functional',{ attrs: { name: 'foo' } })
    ]
    )
  }
})
  .$mount('#app')
