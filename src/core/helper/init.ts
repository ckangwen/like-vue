import { Vue, observe } from '@/core'
import { ComponentOptions } from '@/types'
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

export function initState(vm: Vue, options: ComponentOptions) {
  vm._watcher = undefined
  vm._watchers = []
  if (options.data) {
    initData(vm)
  } else {
    observe(vm._data = {})
  }
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