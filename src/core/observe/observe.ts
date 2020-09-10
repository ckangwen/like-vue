import { Dep } from './Dep';
import { arrayMethods } from './array';
import {
  def,
  hasOwn,
  isObject,
  isPlainObject,
  __DEV__
} from '@/shared'


export class Observer {
  value: any
  /**
   * 保存观察该状态的所有Watcher
   */
  dep: Dep

  constructor(value: any) {
    this.value = value
    this.dep = new Dep()

    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      (value as any).__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(obj: Object) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key)
    })
  }

  observeArray(items: any[]) {
    items.forEach(item => {
      observe(item)
    })
  }
}

function dependArray(values: any[]) {
  values.forEach(value => {
    if (isObservable(value)) {
      value.__ob__.dep.depend()
    }

    if (Array.isArray(value)) dependArray(value)
  })
}

export function observe(value: any): Observer | undefined {
  /* 值类型不用进行响应式转换 */
  if (!isObject(value)) return
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    return value.__ob__
  }
  if (
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value)
  ) {
    return new Observer(value)
  }
}


export function defineReactive(
  obj: Record<string, any>,
  key: string,
  val?: any,
  customSetter?: PropertyDescriptor['set'],
  shallow?: boolean // 如果设置为true，则不会对val进行响应式处理，即只对obj的key属性的值响应式处理
) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  const getter = property && property.get
  const setter = property && property.set

  val = val ? val : obj[key]

  let childOb = !shallow && observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter  () {
      const value = getter ? getter.call(obj) : val
      /**
       * 首先需要知道的是，Dep.target值若不为空，则表示Watcher正在读取它的依赖(读取getter)
       * 而事情发生在reactiveGetter中，Watcher正在读取obj对象
       * 那么就通知Watcher将该对象进行收集(在Watcher中会进一步判断是否该对象已经被收集)
       * 收集的是该状态的Dep，因为dep中存放着Watcher(订阅者)列表
       *
       * 与订阅观察者模式的不同是，前者是把所有的事件以及回调存放在一个全局统一变量中，通过事件名触发事件，依次调用回调函数列表中属于该事件名的回调函数
       * 而在vue中，每个状态都有一份独立的Dep，其中存放的是Watcher，在状态发生变化时，会遍历状态的Dep，触发Watcher的update()方法
       */
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep!.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function  reactiveSetter  (newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      if (__DEV__ && customSetter) {
        customSetter(newVal)
      }
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }

      childOb = !shallow && observe(newVal)
      // 依赖变化后，触发更新，通知Dep类调用notify来触发所有Watcher对象的update方法更新对应视图
      /**
       * 获取到观察该状态的所有Watcher
       * 触发更新
       * (观察者模式中是调用订阅列表中的函数)
       */
      dep.notify()
    }
  })
}


/*  helper */
function isObservable(value: any) {
  if (value && value.__ob__) {
    return true
  }
  return false
}

/**
 * on   - getter => dep.depend() => watcher.deps.add(dep)
 * emit - update => run
 */