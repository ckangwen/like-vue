import { Dep, pushTarget, popTarget } from './Dep';
import { CtorWatcherOptions } from '@/types/observe';
import {
  __DEV__,
  noop,
  remove,
  isObject
} from '@/shared'

type withWatcher = {
  _watcher?: Watcher<any>
  _watchers?: Watcher<any>[]
  [key: string]: any
}


let uid = 0

export class Watcher<T extends withWatcher> {
  vm: T
  id: number
  cb: (newValue: any, oldValue: any) => any
  value?: any;

  deep: boolean;
  dirty: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  active?: boolean;

  getter?: Function;
  before?(): Function;


  /**
   * 存储的是计算属性中该状态的
   */
  deps: Dep[];
  newDeps: Dep[];
  depIds: Set<any>;
  newDepIds: Set<any>;

  constructor(
    vm: T,
    expOrFn: Function | string,
    cb: (newValue: any, oldValue: any) => any,
    options?: CtorWatcherOptions,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    this.cb = cb

    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers?.push(this)

    this.active = true
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.dirty = this.lazy

    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.id = ++uid

    if (typeof expOrFn === 'string') {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        __DEV__ && console.warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
        )
      }
    } else {
      this.getter = expOrFn
    }

    this.value = this.lazy ? undefined : this.get()
  }

  get(this: any) {
    /**
     * Dep.target是一个Watcher，表示该Watcher正在访问依赖
     */
    pushTarget(this)
    const value = this.getter!.call(this.vm, this.vm)
    popTarget()
    this.cleanupDeps()
    return value
  }

  cleanupDeps() {
    let i = this.deps!.length || 0
    while (i--) {
      const dep = this.deps![i]
      // 遍历deps，找出不在newDeps里的dep
      if (!((this.newDepIds)?.has(dep.id))) {
        dep.removeSub(this)
      }
    }
    // depIds
    let tmp: any = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = this.depIds
    this.newDepIds?.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps!.length = 0
  }

  /**
   * 该方法在依赖(observer)被访问的时候触发，然后把该依赖的dep存入正在观察的watcher的deps中
   * 添加依赖的dep原因是为了在
   * 读取到了一个依赖(observer)判断是否将其纳入了deps中
   * 如果没有则新增，反之则表示该依赖已被收录
   * 为什么添加dep?
   *
   */
  addDep(dep: Dep) {
    const id = dep.id
    /**
     * 在最新值获取完毕之后，newDepIds将会清空
     */
    if (!this.newDepIds.has(id)) { // 该依赖尚不存在，则添加
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      /**
       * 如果depIds中不存在这个的dep的id
       * 表示Watcher还没有订阅该状态
       */
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * 在依赖被重新赋值之后，需要更新这个依赖所属的watcher的value
   * 并触发回调函数
   */
  update() {
    // TODO 异步更新
    if (this.lazy) {
      this.dirty = true
    } else {
      this.run()
    }
  }

  /**
   * 重新获取Watcher的值
   * 值变化后触发回调函数
   */
  run() {
    if (this.active) {
      /**
       * this.get()获取当前最新的值
       * 如果当前最新值与更新前的值(this.value)不一致，则需要更新this.value，并触发回调
       */
      const value = this.get()
      if (
        value !== this.value ||
        isObject(value)
      ) {
        const oldValue = this.value
        this.value = value
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
  evaluate() { }

  // TODO
  /**
   * 在computed中使用，如果Dep.target存在，则触发watcher.depend()
   * computed中的值变化之后，重新收集依赖？
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  teardown() { }
}

/******** helper *******/
export const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
function parsePath(path: string) {
  if (bailRE.test(path)) return

  const segments = path.split('.')
  return function (obj: any) { // 调用obj.xx.xxx
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}