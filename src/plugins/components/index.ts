import { Vue } from '@/core/Vue'
import { isHTMLTag, hasOwn, camelize, capitalize, __DEV__ } from '@/shared'
import { VNodeData, VueCtor, ComponentOptions } from '@/types';
import { VNode } from '@/core/vdom/vnode'
import { createComponent } from './createComponent';


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

function createElement(context: Vue, tag: string, data: VNodeData, children: VNode[]) {
  let vnode: VNode | undefined
  if (typeof tag === 'string' && !isHTMLTag(tag)) {
    const components = context.$options.components
    let CompOptions = resolveGlobalComponents(components, tag)
    if (CompOptions) {
      vnode = createComponent(CompOptions, data, context, (children as VNode[]), tag)
    }
  }
  return vnode
}

function setOptions(vm: Vue, options: ComponentOptions) {
  if (options && options._isComponent) {
    /* 继承父级组件的options */
    const opts: ComponentOptions = vm.$options = Object.create((vm.constructor as VueCtor).options)
    opts.parent = options.parent

    const parentVnode = options._parentVnode!

    const componentOptions = parentVnode.componentOptions
    /* 初始化option.propsData */
    opts.propsData = componentOptions.propsData
    // opts._parentListeners = vnodeComponentOptions.listeners

    // 记录组件名，在formatComponentName中使用
    opts._componentTag = componentOptions.tag
    if (options.render) {
      opts.render = options.render
    }
  }
}


export default {
  install(Vue: VueCtor) {
    Vue.config.set('createElement', createElement)
    Vue.config.set('setOptions', setOptions)
  }
}
