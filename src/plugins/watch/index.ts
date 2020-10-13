import { Vue } from '@/core/Vue'
import { Watcher } from '@/core'
import { isPlainObject, isObject, noop } from '@/shared'
import { VueCtor, PlainObject } from '@/types'

type VueInstance = {
  $watch?: any
}
type WatchHandler = (this: Vue, val: any, oldVal: any) => void;
type UserWatchOptions = {
  deep?: boolean
  immediate?: boolean
  handler?: WatchHandler
}
type BaseWatchOptions = {
  user?: boolean
}
type WatchOptions = PlainObject<Function | UserWatchOptions & BaseWatchOptions>


const initWatch = (vm: Vue & VueInstance, watch: WatchOptions) => {
  vm.$watch = function (this: Vue, expOrFn: string | Function, cb: any = noop, options: (UserWatchOptions & BaseWatchOptions) = {}) {
    if (isObject(cb)) {
      return createWatcher(this, expOrFn, cb, options)
    }

    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }

    return function unwatchFn() {
      watcher.teardown()
    }
  }
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

const createWatcher = (
  vm: Vue & VueInstance,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) => {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler as keyof Vue]
  }
  return vm.$watch && vm.$watch(expOrFn, handler, options)
}

const WatchPlugin = {
  install(Vue: VueCtor) {
    Vue.mixin({
      created(this: Vue) {
        const vm: Vue = this
        const { watch } = this.$options
        initWatch(vm, watch)
      }
    })
  }
}

export default WatchPlugin
