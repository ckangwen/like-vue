import { Matcher } from './Matcher';
import { RawLocation, Route, RouteRecord, NavigationGuard } from './types/router';
import { HashHistory } from './history/hash';
import { warn } from './utils/helper';
import { HTML5History } from './history/html5';
import { normalizeLocation } from './utils/location';
import { cleanPath } from './utils/path';

export class VueRouter {
  app: any
  options: any
  history: HashHistory | HTML5History
  matcher: any
  mode: 'hash' | 'history'
  beforeHooks: NavigationGuard[]
  resolveHooks: NavigationGuard[]
  afterHooks: NavigationGuard[]

  constructor(options = {} as any) {
    this.app = null
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = new Matcher(options.routes || [], this)
    const mode = options.mode || 'hash'
    this.mode = mode
    this.history = null as any

    switch (mode) {
      case 'hash':
        this.history = new HashHistory(this, options.base)
        break;
      case 'history':
        this.history = new HTML5History(this, options.base)
        break;
      default:
        warn( `invalid mode: ${mode}`)
        break;
    }

  }
  get currentRoute (): Route {
    return this.history && this.history.current
  }

  match (raw: RawLocation, current?: Route, redirectedFrom?: Location): Route {
    return this.matcher.match(raw, current, redirectedFrom)
  }

  init(app: any) {
    if (this.app) {
      return
    }

    this.app = app

    const history = this.history
    const setupListeners = () => {
      history.setupListeners()
    }
    history.transitionTo(
      history.getCurrentLocation(),
      setupListeners,
      setupListeners
    )

    /* 在完成路由跳转之后执行listen中的回调，更新$route */
    history.listen((route: any) => {
      this.app._route = route
    })
  }

  push(location: RawLocation, onComplete?: Function, onAbort?: Function) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
      })
    } else {
      this.history.replace(location, onComplete, onAbort)
    }
  }

  go (n: number) {
    this.history.go(n)
  }

  back () {
    this.go(-1)
  }

  forward () {
    this.go(1)
  }

  resolve(to: RawLocation, current?: Route, append?: boolean) {
    current = current || this.history.current
    const location = normalizeLocation(to, current, append)
    const route = this.match(location, current)
    const fullPath = route.redirectedFrom || route.fullPath
    const base = this.history.base
    const href = this.createHref(base, fullPath!)

    return {
      location,
      route,
      href,
      resolved: route
    }
  }

  getMatchedComponents(to: RawLocation | Route) {
    const route: any = to
      ? (to as Route).matched
        ? to
        : this.resolve((to as RawLocation)).route
      : this.currentRoute
    if (!route) {
      return []
    }
    return [].concat(
      [],
      route.matched.map((m: RouteRecord) => {
        return Object.keys(m.components).map(key => {
          return m.components[key]
        })
      })
    )
  }

  beforeEach (fn: Function): Function {
    return this.registerHook(this.beforeHooks, fn)
  }

  beforeResolve (fn: Function): Function {
    return this.registerHook(this.resolveHooks, fn)
  }

  afterEach (fn: Function): Function {
    return this.registerHook(this.afterHooks, fn)
  }


  private createHref(base: string, fullPath: string) {
    const path = this.mode === 'hash' ? '#' + fullPath : fullPath
    return base ? cleanPath(base + '/' + path) : path
  }

  private registerHook(list: Function[], fn: Function) {
    list.push(fn)
    return () => {
      const i = list.indexOf(fn)
      if (i > -1) list.splice(i, 1)
    }
  }
}