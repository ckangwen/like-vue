import { Vue } from '@/core/Vue'
import { Watcher, Dep } from '@/core'
import { __DEV__, noop, extend } from '@/shared'
import { VueCtor } from '@/types'

declare module "@/core" {
  interface Vue {
    _computedWatchers: Record<string, Watcher<Vue>>
  }
}

type ComputedType = {
  get: Function
  set: Function
} | Function


function computedMergeStrategy(parent: Object, child: Object) {
  if (!parent) return child
  const res = Object.create(null)
  extend(res, parent)
  if (child) extend(res, child)
  return res
}


const sharedPropertyDefinition: PropertyDescriptor = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function initComputed(vm: Vue, computed: Record<string, ComputedType>) {
  const watchers = vm._computedWatchers = Object.create(null)
  for (const key in computed) {
    const userDef = computed[key]
    /** computed可能是一个function也可能是getter + setter */
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (__DEV__ && !getter) {
      console.warn(
        `Getter is missing for computed property "${key}".`,
      )
    }

    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      {
        lazy: true
      }
    )

    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    }

  }
}

function defineComputed(target: Vue, key: string, userDef: any) {
  // 默认computed应该缓存
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get ?
      userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get) // 绑定getter的作用域?
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
function createComputedGetter(key: string) {
  return function computedGetter(this: Vue) {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      /**
       * 脏检测，在计算属性中的依赖发生变化时，dirty会变为true，
       * 在get的时候重新计算计算属性的输出值
       */
      // TODO 第一次更状态新时，不能及时的响应
      if (watcher.dirty) {
        watcher.evaluate()
      }
      /** 收集依赖 */
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
function createGetterInvoker(fn: Function) {
  return function computedGetter (this: any) {
    return fn.call(this, this)
  }
}

export default {
  install(Vue: VueCtor) {
    Vue.config.set('optionMergeStrategies.computed', computedMergeStrategy)

    Vue.mixin({
      created(this: Vue) { // created生命周期之后可以访问到data中的值
        const vm: Vue = this
        const { computed } = this.$options
        initComputed(vm, computed)
      }
    })
  }
}