import { Watcher } from './observe/Watcher';
import { ComponentOptions } from '@/types'
import { createElement } from './vdom/createElement';
import { VNode } from './vdom/vnode';
import { patch } from './vdom/patch';
import { initState } from './helper/init';
import {
  isPlainObject,
  __DEV__,
  hasOwn,
  isReserved,
  hyphenate,
  isHTMLTag,
  noop,
  isDef,
  query,
  inBrowser
} from '@/shared'

let uid = 0

export class Vue {
  static cid: number
  options?: ComponentOptions
  super?: Vue
  _watcher?: Watcher<Vue>
  _watchers?: Watcher<Vue>[]
  _vnode: VNode | null


  _uid: number
  _self: Vue
  _data?: Record<string, any>

  $el: Element | null
  $options: ComponentOptions
  $children?: any[]
  $createElement?: Function;

  __patch__ = patch


  constructor(options: ComponentOptions = {}) {
    this._uid = ++uid
    this._self = this
    this.$options = options
    this.$children = []
    this._vnode = null

    this.$el = null
    this.$createElement = (a: any, b: any, c: any) => createElement(this, a, b, c)

    initState(this, options)
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
      noop
    )
  }
}
