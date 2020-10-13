import { Vue } from '@/core/Vue';
import { START } from '../utils/route';
import { inBrowser } from '../utils/helper';
import { extractEnterGuards, extractLeaveGuards, extractUpdateHooks } from '../utils/guard';
import { createNavigationCancelledError, isError, createNavigationAbortedError, createNavigationRedirectedError } from '../utils/error';
import { Route, RawLocation, RouteRecord, NavigationGuard, NavigationGuardCallback } from '../types/router';
import { VueRouter } from '../VueRouter';

export class BaseHistory {
  router: VueRouter
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
  setupListeners() { }
  getCurrentLocation() { }
  go(n: number) { }
  push(loc: RawLocation, onComplete?: Function, onAbort?: Function) { }
  replace(
    loc: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) { }
  ensureURL(push?: boolean) { }

  /* 通用方法实现 */
  listen(cb: Function) {
    this.cb = cb
  }
  onReady(cb: Function, errorCb?: Function) {
    if (this.ready) {
      cb()
    } else {
      this.readyCbs.push(cb)
      if (errorCb) {
        this.readyErrorCbs.push(errorCb)
      }
    }
  }
  onError(errorCb: Function) {
    this.errorCbs.push(errorCb)
  }
  updateRoute(route: Route) {
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
      (route: Route) => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()

        /* 路由跳转结束之后，调用 afterEach 导航守卫 */
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })

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

  /**
   * 进行路由跳转
   */
  confirmTransition(route: Route, onComplete: Function, onAbort?: Function) {
    // 当前路径所表示的路由对象
    const current = this.current
    this.pending = route
    const abort = (err: any) => { onAbort && onAbort(err) }

    // if (isSameRoute(route, current)) {}

    const { updated, deactivated, activated } = this.resovleQueue(route)

    /**
     * 路由导航被调用的顺序为
     * 失活组件中的beforeRouteLeave
     * 全局beforeEach
     * 重用组件中的beforeRouteUpdate
     * 路由配置中的beforeEnter
     * 异步路由组件(TODO 暂未实现)
     *
     * 激活组件中的beforeRouteEnter
     * 全局beforeResolve
     * 全局afterEach
     */
    const queue: NavigationGuard[] = ([] as any[]).concat(
      extractLeaveGuards(deactivated), // 失活组件中的beforeRouteLeave
      this.router.beforeHooks, // 全局beforeEach
      extractUpdateHooks(updated), // 重用组件中的beforeRouteUpdate
      activated.map(m => m.beforeEnter).filter(item => item) as NavigationGuard[], // 路由配置中的beforeEnter
    )

    const iterator = (hook: NavigationGuard) => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }

      /**
       * route: 将要跳转的路由
       * current: 当前的路由
       * (to) => void: 在导航守卫中调用的next，参数to即是传给next的参数,egs: next('/login')
       * */
      hook(route, current, (to: any) => {
        if (to === false) {
          this.ensureURL(true)
          abort(createNavigationAbortedError(current, route))
        } else if (isError(to)) {
          this.ensureURL(true)
          abort(to)
        } else if (
          typeof to === 'string' ||
          (
            typeof to === 'string' || (
              typeof to.path === 'string' || typeof to.name === 'string'
            )
          )
        ) {
          abort(createNavigationRedirectedError(current, route))
          if (typeof to === 'object' && to.replace) {
            this.replace(to)
          } else {
            this.push(to)
          }
        } else {
          // console.log('next(to)')
        }
      })
    }

    const _confirmTransition = () => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }

      this.pending = null
      onComplete(route)
    }


    /* 没有路由导航 */
    if (queue.length < 1) {
      _confirmTransition()
      return
    }

    // TODO 没有使用异步遍历
    queue.forEach((guardFn, index) => {
      guardFn && iterator(guardFn)

      if (index === queue.length - 1) {
        /**
         * beforeRouteEnter (to, from, next)
         * beforeRouteEnter期间，无法获取到路由实例，可以通过传一个回调给 next来访问组件实例
         * 在导航被确认的时候执行回调
         */
        const postEnterCbs: NavigationGuardCallback[] = []
        // 判断前后跳转的是否是同一个路由
        const isValid = () => this.current === route


        /* 获取activated匹配的组件中的beforeRouteEnter */
        const beforeRouteEnterGuards = extractEnterGuards(activated, postEnterCbs, isValid) as NavigationGuard[]
        const guards = beforeRouteEnterGuards.concat(this.router.resolveHooks)

        /* 此时新登场的页面组件尚未被创建 */

        if (guards.length < 1) {
          _confirmTransition()
          return
        }

        guards.forEach((gFn, idx) => {
          gFn && iterator(gFn)
          if (idx === guards.length - 1) {
            _confirmTransition()

            /* 确认导航且创建组件之后，调用beforeRouteEnter的回调函数 */
            if (this.router.app) {
              // TODO Vue.$nextTick
              postEnterCbs.forEach(cb => {
                cb()
              })
            }
          }
        })

      }
    }) // 路由导航遍历结束
  }
  teardown() {
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
    const current = this.current.matched!
    const next = route.matched!
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

function normalizeBase(base?: string): string {
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
