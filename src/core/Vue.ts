import { Watcher } from '@/core/observe';
import { ComponentOptions, VuePlugin, VueExtend, VueMixin, VuePluginOptions } from '@/types'
import { VNode, patch } from '@/core/vdom';
import { initGlobalAPI } from './global-api/index';
import { VueCtor } from '../types/vue';
import {
  callHook,
  initState,
  initRender,
  initEvent,
  initLifecycle,
  mergeOptions,
  resolveConstructorOptions
} from '@/core/helper';
import {
  __DEV__,
  noop,
  query,
  inBrowser
} from '@/shared'

let uid = 0

export class Vue {
  // constructor(options: ComponentOptions): Vue
  static cid: number
  static options: ComponentOptions
  static config?: any;
  static use: VuePlugin
  static mixin:  VueMixin
  static extend:  VueExtend
  static _installedPlugins: VuePluginOptions[] = []
  static component: Function
  static super?: VueCtor
  static superOptions?: ComponentOptions
  static extendOptions?: ComponentOptions
  options?: ComponentOptions
  _watcher?: Watcher<Vue>
  _watchers?: Watcher<Vue>[]
  _vnode: VNode | null = null


  _uid: number
  _self: Vue
  _data?: Record<string, any>
  _events: any;
  _isMounted: boolean = false

  $el: Element | null
  $options: ComponentOptions
  $children?: any[]
  $createElement?: Function;
  $vnode: VNode | null = null

  __patch__ = patch


  constructor(options: ComponentOptions = {}) {
    this._uid = ++uid
    this._self = this
    this.$children = []

    /**
     * 与全局options进行合并
     * 例如Vue.mixin()
     * */
    this.$options = mergeOptions(resolveConstructorOptions((this as any).constructor), options, this)


    this.$el = null


    initLifecycle(this)
    initEvent(this)
    initRender(this)
    callHook(this, 'beforeCreate');
    initState(this)
    callHook(this, 'created');
  }

  _render() {
    const { render } = this.$options
    let vnode = render && render.call(this, this.$createElement)

    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    return vnode
  }

  _update(vnode: VNode, hydrating?: boolean) {
    /**
     * _vnode记录当前DOM映射的VNode
     * 此时的_vnode还没有更新，所以指代的是更新前的vnode
     *  */
    const prevVnode = this._vnode

    /**
     * 更新_vnode
     * */
    this._vnode = vnode

    if (!prevVnode) {
      // initial render
      this.$el = this.__patch__(this.$el!, vnode) as Element
    } else {
      // updates
      this.$el = this.__patch__(prevVnode, vnode) as Element
    }
  }

  $mount(el?: string | Element | undefined, hydrating?: boolean) {
    el = el && inBrowser ? query(el) : undefined
    if (!el) {
      __DEV__ && console.warn(
        `${el} does not exist`
      )
      return this
    }
    if (el === document.body || el === document.documentElement) {
      __DEV__ && console.warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
      return this
    }
    this.$el = el

    /**
     * render watcher
     * 观察渲染函数中状态(state，observer)的变化，如果变化则触发更新(_update)
     * 之所以能够观察到渲染函数中的状态是因为Watcher需要监听的表达式是一个函数，如果是一个函数，则其中所有被访问的对象都会被监听
     */
    new Watcher(
      this, () => {
        this._update(this._render(), hydrating)
      },
      noop,
      undefined,
      true
    )

    this._isMounted = true
    callHook(this, 'mounted')
  }
}

initGlobalAPI(Vue)
