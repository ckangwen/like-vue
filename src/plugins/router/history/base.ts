import { Route, RawLocation, RouteRecord } from "../types/router"
import { START } from '../utils/route';
import { inBrowser } from '../utils/helper';

export class BaseHistory {
  router: any
  base: string
  current: Route
  pending?: Route | null = null // 正在处理中的路由对象，如果没有激活的路由，则为null
  cb: Function | null = null
  ready: boolean = false
  readyCbs: Function[] = []
  readyErrorCbs: Function[] = []
  errorCbs: Function[] = []
  listeners: Function[] = []
  cleanupListeners: Function[] = []

  constructor(router: any, base: string) {
    this.router = router
    this.base = normalizeBase(base)
    this.current = START
  }

  /* 需要继承实现 */
  setupListeners() {}
  getCurrentLocation() {}
  go (n: number) {}
  push (loc: RawLocation, onComplete?: Function, onAbort?: Function) {}
  replace (
    loc: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {}
  ensureURL (push?: boolean) {}

  /* 通用方法实现 */
  listen (cb: Function) {
    this.cb = cb
  }
  onReady (cb: Function, errorCb?: Function) {
    if (this.ready) {
      cb()
    } else {
      this.readyCbs.push(cb)
      if (errorCb) {
        this.readyErrorCbs.push(errorCb)
      }
    }
  }
  onError (errorCb: Function) {
    this.errorCbs.push(errorCb)
  }
  updateRoute (route: Route) {
    this.current = route
    this.cb && this.cb(route)
  }
  transitionTo(
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    let route = this.router.match(location, this.current)
    const prev = this.current

    this.confirmTransition(
      route,
      () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      (err: any) => {
        if (onAbort) {
          onAbort(err)
        }
      }
    )
  }
  // TODO 未实现路由守卫
  /**
   * 进行路由跳转
   */
  confirmTransition(route: Route, onComplete: Function, onAbort?: Function) {
    // 当前路径所表示的路由对象
    const current = this.current
    this.pending = route
    const abort = (err: any) => { onAbort && onAbort(err) }

    const { updated, deactivated, activated } = this.resovleQueue(route)
    // 解析activated数组中所有routeRecord里的异步路由组件
    if (this.pending !== route) {
      // return abort(createNavigationCancelledError(current, route))
    }
    this.pending = null
    onComplete(route)

  }
  teardown () {
    this.listeners.forEach(cleanupListener => {
      cleanupListener()
    })

    this.listeners = []
    this.current = START
    this.pending = null
  }

  /**
   * 路由从`this.current`转变为`route`
   * 对 this.current.matched, route.matched中的routRecord遍历一一对比
   * 提取出updated(相同routeRecord), deactivated(current中将要失活的routeRecord),activated(route中即将激活的routeRecord)
   */
  private resovleQueue(route: Route) {
    const current = this.current.matched
    const next = route.matched
    let i
    const max = Math.max(current.length, next.length)
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }

  }
}

function normalizeBase (base?: string): string {
  if (!base) {
    if (inBrowser) {
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      base = base.replace(/^https?:\/\/[^\/]+/, '')
    } else {
      base = '/'
    }
  }

  if (base.charAt(0) !== '/') {
    base = '/' + base
  }
  return base.replace(/\/$/, '')
}
