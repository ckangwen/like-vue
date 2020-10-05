import { Vue} from '@/core/Vue'
import { observe } from '@/core/observe'
import { createElement } from '@/core/vdom'
import { ComponentOptions, LiftcycleEnum } from '@/types'
import {
  isPlainObject,
  __DEV__,
  hasOwn,
  isReserved,
  noop,
} from '@/shared'

export function initEvent(vm: Vue) {
  vm._events = Object.create(null)
}

export function initLifecycle(vm: Vue) {
  vm._isMounted = false
  let parent = vm.$options.parent
  vm.$parent = parent
}

export function initRender(vm: Vue) {
  vm._vnode = null
  vm.$createElement = (a: any, b: any, c: any) => createElement(vm, a, b, c)
}

export function initState(vm: Vue) {
  const options = vm.$options
  vm._watcher = undefined
  vm._watchers = []

  if (options.data) {
    initData(vm)
  } else {
    observe(vm._data = {})
  }
  options.methods && initMethods(vm)
}


function initData(vm: Vue) {
  let data = vm.$options.data
  if (!data) return
  data = vm._data = typeof data === 'function' ? data.call(vm, vm) : data || {}

  if (!isPlainObject(data)) {
    data = {}
    __DEV__ && console.warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
    )
  }

  const keys = Object.keys(data as Record<string, any>)
  const props = vm.$options.props
  const methods = vm.$options.methods

  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (__DEV__) {
      /* 保证data中的key不与props中的key重复，props优先 */
      if (methods && hasOwn(methods, key)) {
        console.warn(
          `Method "${key}" has already been defined as a data property.`,
        )
      }
    }
    // 如果props有与data同名的方法，给出警告
    if (props && hasOwn(props, key)) {
      __DEV__ && console.warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
      )
    } else if (!isReserved(key)) { // 不是保留字段
      /* 将data的属性代理到vm实例上 */
      proxy(vm, `_data`, key)
    }
  }

  observe(data)
}

function initMethods(vm: Vue) {
  const { methods } = vm.$options
  for(const key in methods) {
    if (typeof methods[key] !== 'function') {
      console.warn(
        `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
        `Did you reference the function correctly?`
      )
    }

    /**
     * 因为方法在Vue示例中通过this调用
     * 所以方法的作用域绑定到vm实例
     * */
    // TODO vm上不能定义任意类型的属性
    (vm as any)[key] = typeof methods[key] !== 'function' ? noop : Function.prototype.bind.call(methods[key], vm)
  }
}

const sharedPropertyDefinition: PropertyDescriptor = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

/**
 * 在target上设置一个代理，实现通过访问target.key来访问target.sourceKey.key的目的
 */
export function proxy(target: Record<string, any>, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return target[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    target[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function callHook(vm: Vue, hook: LiftcycleEnum) {
  let handlers = vm.$options[hook]
  if (!handlers) return
  handlers = Array.isArray(handlers) ? handlers : [handlers]

  handlers.forEach(handler => {
    handler.call(vm)
  })
}
