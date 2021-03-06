import { Vue } from '@/core/Vue'
import { ModuleHooks, ModuleHookEnum, ComponentOptions, VNodeData } from '@/types'
import { VNode } from '@/core/vdom/vnode'
import { isObject, __DEV__ } from '@/shared'
import { extractPropsFromVNodeData } from './helper/extra-props';
import { updateComponentListeners } from '@/core/helper'
import { createFunctionalComponent } from './functional-component';

export function createComponent(
  Ctor: any,
  vnodeData: VNodeData = {},
  context: Vue,
  children?: VNode[],
  tag?: string
): VNode | null {
  if (!Ctor) return null

  /* 根类，因为它拥有比较全面的api */
  const baseCtor = context.$options._base

  /**
   * 若Ctor是一个对象，则利用Vue.extend将其扩展为Vue子类
   * 适用于注册局部组件的情况，直接将组件的选项(options)传入
   */
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  /* 如果在此阶段Ctor依旧不是一个函数，则表示组件定义有误 */
  if (typeof Ctor !== 'function') {
    if (__DEV__) console.warn(`Invalid Component definition: ${String(Ctor)}`)
    return null
  }

  /* vnodeData.props作为用户传递的数据，Ctor.options.props作为组件接收的数据 */
  const propsData = extractPropsFromVNodeData(vnodeData, Ctor, tag) || {} as any

  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, vnodeData, context, children) as any
  }

  const listeners = vnodeData.on

  /* 调用生成组件的必要的hook，在渲染vnode的过程中调用 */
  installComponentHooks(vnodeData)

  /* 记录组件名，用于生成组件tag */
  const name = Ctor.options.name || tag

  const vnode = new VNode({
    context,
    data: vnodeData,
    tag: `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    componentOptions: {
      parent: context,
      Ctor,
      tag,
      children,
      propsData,
      listeners
    }
  })

  return vnode
}

const componentVNodeHooks: ModuleHooks = {
  init(vnode: VNode, hydrating?: boolean) {
    /* 生成组件实例 */
    const child = vnode.componentInstance = createComponentInstance(vnode, vnode.componentOptions)
    /* 渲染为真实DOM */
    child.$mount(hydrating ? (vnode.elm as Element) : undefined, hydrating)
  },
  prepatch(oldVnode: VNode, vnode: VNode) {
    /* 这里的children指代的是插槽 */
    const { listeners, propsData, children } = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    child.$options.componentVnode = vnode
    const oldListeners = child.$options._parentListeners
    updateComponentListeners(child, listeners, oldListeners)

    // update vm's placeholder node without re-render
    child.$vnode = vnode

    /* _props存储的props的键值对, _props将会被代理到vm上 */
    if (propsData && child.$options.props) {
      const props = child._props
      const propKeys = child.$options._propKeys || []
      Object.keys(propKeys).forEach(key => {
        props[key] = propsData[key]
      })
    }

    if (child._vnode) { // update child tree's parent
    child._vnode.parent = vnode
    }
  },
  destroy(vnode: VNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      componentInstance.$destory()
    }
  }
}


function createComponentInstance(
  vnode: VNode,
  componentOptions: any
): Vue {
  const options: ComponentOptions = {
    _isComponent: true,
    componentVnode: vnode,
    ...componentOptions
  }

  return new componentOptions.Ctor(options)
}

function installComponentHooks(data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  let key: ModuleHookEnum
  for(key in componentVNodeHooks) {
    const hook = componentVNodeHooks[key]
    if (!hook) continue
    if (!hooks[key]) {
      hooks[key] = new Set() as any
    }
    hooks[key]!.add(hook as any)
  }
}
