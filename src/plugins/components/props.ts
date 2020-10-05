import { Vue } from '@/core/Vue'
import { __DEV__, hyphenate, noop, isHTMLTag } from '@/shared'
import { defineReactive } from '@/core'

type AdditionalPropsType = {
  _props: any
}

export function initProps(vm: Vue & AdditionalPropsType, propsOptions: any) {
  /* propsData保存的是通过父组件或用户传递的真实props数据 */
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  /* 缓存当前实例的所有props的key */
  const keys: string[] = vm.$options._propKeys = []
  /* 没有父节点则表示是根节点 */
  const isRoot = !vm.$parent

  for (const key in propsOptions) {
    keys.push(key)
    // TODO 校验props【validateProp(key, propsOptions, propsData, vm)】
    const value = propsData[key]

    if (__DEV__) {
      const hyphenatedKey = hyphenate(key)
      /* 是否是保留字段 */
      if (isReservedAttribute(hyphenatedKey) || isHTMLTag(hyphenatedKey)) {
        console.warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`
        )
      }

      defineReactive(props, key, value, () => {
        if (!isRoot) {
          /* 由于父组件重新渲染的时候会重写prop的值，所以应该直接使用prop来作为一个data或者计算属性的依赖 */
          console.warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }

    if (!(key in vm)) {
      // 访问vm[key] 等同于 访问vm._props[key]
      proxy(vm, '_props', key)
    }
  }
}

const isReservedAttribute = (key: string) => [ 'key', 'ref', 'slot', 'slot-scope', 'is' ].indexOf(key) > -1


const sharedPropertyDefinition: PropertyDescriptor = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

/**
 * 在target上设置一个代理，实现通过访问target.key来访问target.sourceKey.key的目的
 */
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter (this: any) {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (this: any, val: any) {
    this[sourceKey][key] = val
  } as any
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
