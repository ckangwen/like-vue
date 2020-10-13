import { Vue } from '@/core/Vue'
import { flatten, flatMapComponents } from './resolve-components';
import { RouteRecord, NavigationGuard, Route, ComponentNavigationGuardKeys, NavigationGuardCallback } from '../types/router';
import { Dictionary } from '../types/helper';

type GuardBindFunction = (guard: NavigationGuard, instance: Vue, matched: RouteRecord, key: string) => any

/**
 * beforeRouteLeave
 * beforeRouteUpdate
 * beforeRouteEnter
 * 都是组件选项
 * 需要从组件的$options中获取
 * */
export function extractEnterGuards(activated: RouteRecord[], cbs: NavigationGuardCallback[], isValid: () => boolean) {
  return extractInComponentGuards(
    activated,
    'beforeRouteEnter',
    (guard: NavigationGuard, _: Vue, match: RouteRecord, key: string) => {
      return bindBeforeRouteEnterGuard(guard, match, key, cbs, isValid)
    }
  )
}
export function extractUpdateHooks (updated: RouteRecord[]) {
  return extractInComponentGuards(
    updated,
    'beforeRouteUpdate',
    bindGuard
  )
}
export function extractLeaveGuards(deactivated: RouteRecord[]) {
  return extractInComponentGuards(
    deactivated,
    'beforeRouteLeave',
    bindGuard,
    true
  )
}


/**
 * 获取路由记录中匹配到的组件的路由导航
 * @param {Function} bind：为了使路由导航方法能在正确的作用域中执行
 * @param {Boolean} reverse 是否反转路由导航执行的顺序，默认父级组件的导航守卫先调用
 */
function extractInComponentGuards(
  records: RouteRecord[],
  name: ComponentNavigationGuardKeys,
  bind: GuardBindFunction,
  reverse?: boolean
) {
  /* 获取路由记录中所有组件的组件导航守卫 */
  const guards = flatMapComponents(
    records,
    (component: Vue | Object, instance: Vue, matched: RouteRecord, key: string) => {
      const guard = extractComponentGuard(component, name)
      let res: NavigationGuard[] = []
      if (guard) {
        if (Array.isArray(guard)) {
          res = guard.map(g => bind(g, instance, matched, key)).filter(t => t) as NavigationGuard[]
        } else {
          res = bind(guard, instance, matched, key)
        }
      }

      return res
    }
  )

  return flatten(reverse ? guards.reverse() : guards)
}


/**
 * 将导航守卫方法绑定到vue实例中，保证作用域
 */
const bindGuard: GuardBindFunction = (guard: NavigationGuard, instance: Vue) => {
  if (instance) {
    const boundRouteGuard: NavigationGuard = (to, from, next) => {
      return guard.call(instance, to, from, next)
    }
    return boundRouteGuard
  }
}

/**
 * beforeRouteEnter守卫与常规的不同，他无法访问this(因为新的页面组件尚未被创建)，需要添加额外的功能
 * 允许给next传递一个回调函数，在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数
 *
 * @param { NavigationGuard } guard: 具体组件中的beforeRouteEnter方法
 */
function bindBeforeRouteEnterGuard(
  guard: NavigationGuard,
  match: RouteRecord,
  key: string,
  cbs: NavigationGuardCallback[],
  isValid: () => boolean
) {
  // beforeRouteEnter(to, from, next) {}
  return function routeEnterGuard(to: Route, from: Route, next: Function) {
    // 调用beforeRouteEnter，可以给next传递一个回调(即此处的cb)
    return guard(to, from, (cb) => {
      if (typeof cb === 'function') {
        cbs.push(() => {
          poll(cb, match.instances, key, isValid)
        })
      }

      next(cb)
    })
  }
}

/**
 * 从组件实例中获取指定的option
 */
function extractComponentGuard(
  component: Vue | Object,
  name: string
) {
  if (typeof component === 'object') {
    component = Vue.extend(component)
  }
  return (component as Vue).options![name] as NavigationGuard
}

function poll(
  cb: NavigationGuardCallback,
  instances: Dictionary<Vue>,
  key: string,
  isValid: () => boolean
) {
  if (
    instances[key]
    // !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
  ) {
    /**
     * next(vm => {})
     * 将组件实例注入回调函数中
     */
    cb(instances[key])
  } else if (isValid()) {
    setTimeout(() => {
      poll(cb, instances, key, isValid)
    }, 16)
  }
}