## 介绍
本项目是在阅读Vuejs(2.6.12)源码以及周边库的过程中对Vue的个人实现。



### Vue

**功能实现**

- [ ] 模板语法
- [x] 计算属性
- [x] 侦听器
- [x] class与style绑定
- [x] 事件功能
- [x] 组件功能
- [x] 插槽
- [ ] 动态组件&异步组件
- [x] 渲染函数
- [ ] 过滤器
- [ ] 指令
- [x] 插件
- [x] mixins
- [ ] 过渡&动画

<br/>

为了更清晰地了解vue的各个功能，本项目**将vue的各个功能最大化的抽离出来，设计为一个独立的插件**。例如其中的计算属性、侦听器和组件功能。

其核心功能的实现仅包括了双向绑定、数据渲染、原生事件处理及其部分全局API。如需额外的功能需要使用`Vue.use()`进行加载。



### VueRouter

**功能实现**

- [x] 导航守卫
- [X] 路由匹配
- [ ] HTML5 History模式
- [ ] 路由组件传参
- [ ] 嵌套路由



### VueX

**功能实现**

- [x] 单一状态数
- [x] store模块的命名空间
- [ ] vuex辅助函数



## 案例演示

```js
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

```

