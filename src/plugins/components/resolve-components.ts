import { Vue } from '@/core/Vue'
import { isHTMLTag, hasOwn, camelize, capitalize, __DEV__ } from '@/shared'
import { VNodeData, VueCtor, ComponentOptions } from '@/types';
import { VNode } from '@/core/vdom/vnode'
import { createComponent } from './createComponent';

export function createElement(context: Vue, tag: string, data: VNodeData, children: VNode[]) {
  let vnode: VNode | undefined | null
  if (typeof tag === 'string' && !isHTMLTag(tag)) {
    const components = context.$options.components
    let CompOptions = resolveGlobalComponents(components, tag)
    if (CompOptions) {
      vnode = createComponent(CompOptions, data, context, (children as VNode[]), tag)
    }
  } else if (typeof tag === 'object') {
    vnode = createComponent(tag, data, context, children)
  }
  return vnode
}

/**
 * 组件的初始化
 */
export function initInternalComponent(vm: Vue, options: ComponentOptions) {
  if (options && options._isComponent) {
    /* 继承父级组件的options */
    const opts: ComponentOptions = vm.$options = Object.create((vm.constructor as VueCtor).options)
    /* 组件的父级vue实例 */
    opts.parent = options.parent

    /* 存储该组件的VNode结构 */
    const parentVnode = opts.componentVnode = options.componentVnode!

    /* 组件的附带信息 */
    const componentOptions = parentVnode.componentOptions
    /* 组件上的事件 */
    opts._parentListeners = options.listeners
    /* 初始化option.propsData，props的值 */
    opts.propsData = componentOptions.propsData
    /* 记录组件的子元素，作为插槽使用 */
    opts.renderChildren = options.children

    // 记录组件名，在formatComponentName中使用
    opts._componentTag = componentOptions.tag
    if (options.render) {
      opts.render = options.render
    }
    vm.$options = opts
  }
}


function resolveGlobalComponents(components: any[], tag: string) {
  if (hasOwn(components, tag)) {
    return components[tag]
  }
  const camelizedId = camelize(tag)
  if (hasOwn(components, camelizedId)) return components[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(components, PascalCaseId)) return components[PascalCaseId]

  if (__DEV__) {
    console.warn(
      'Failed to resolve component' + ': ' + tag
    )
  }
}