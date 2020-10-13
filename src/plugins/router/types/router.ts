import { Vue } from '@/core/Vue'
import { Dictionary } from './helper';
export interface Location {
  name?: string
  path?: string
  hash?: string
  query?: Dictionary<string | (string | null)[] | null | undefined>
  params?: Dictionary<string>
  append?: boolean
  replace?: boolean
  _normalized?: boolean
}

export type RawLocation = string | Location


export type RedirectOption = RawLocation | ((to: Route) => RawLocation)

type RouteComponent = any
type RoutePropsFunction = (route: Route) => Object

/**
 * 基本路由构建属性
 * TODO hook beforeEnter暂未实现
 */
interface BaseRouteConfig {
  path: string
  name?: string
  children?: RouteConfig[]
  redirect?: RedirectOption
  alias?: string | string[]
  meta?: any
}

export interface SingleViewRouteConfig extends BaseRouteConfig {
  component?: RouteComponent
  props?: boolean | Object | RoutePropsFunction
}
export interface MultiViewsRouteConfig extends BaseRouteConfig {
  components?: Dictionary<RouteComponent>
  props?: Dictionary<boolean | Object | RoutePropsFunction>
}

export type RouteConfig = SingleViewRouteConfig & MultiViewsRouteConfig

/**
 * 路由记录
 * VueRouter选项中routes配置数组中的对象副本
 * TODO beforeEnter
 */
export interface RouteRecord {
  path: string
  name?: string
  parent?: RouteRecord
  redirect?: RedirectOption
  meta: any
  props: Pick<SingleViewRouteConfig, 'props'> | Pick<MultiViewsRouteConfig, 'props'>
  regex: RegExp
  matchAs?: string
  instances: Dictionary<Vue>
  components: Dictionary<RouteComponent>
  beforeEnter?: NavigationGuard
}

/**
 * 路由对象
 * 表示当前激活的路由的状态信息
 * 包含了当前 URL 解析得到的信息，还有 URL 匹配到的路由记录
 */
export interface Route {
  path: string
  name?: string | null
  query?: Dictionary<string | (string | null)[]>
  params?: Dictionary<string>
  fullPath?: string
  hash?: string
  matched?: RouteRecord[] // 当前路由的所有嵌套路径片段的路由记录
  redirectedFrom?: string // 重定向来源的路由的名字
  meta?: any
  beforeEnter?: NavigationGuard
}

export type NavigationGuardCallback = (to?: RawLocation | false | Vue | NavigationGuardCallback | void) => void
export type NavigationGuard = (
  to: Route,
  from: Route,
  next?: NavigationGuardCallback
) => any


export type NavigationGuardKeys =
  | 'beforeEach'
  | 'afterEach'
  | 'beforeResolve'
  | 'beforeEnter'
  | 'beforeRouteEnter'
  | 'beforeRouteUpdate'
  | 'beforeRouteLeave'

export type ComponentNavigationGuardKeys =
  | 'beforeRouteEnter'
  | 'beforeRouteUpdate'
  | 'beforeRouteLeave'


export type MatchedComponentConvertFn = (guard: Vue |  Dictionary<any>, instance: Vue, matched: RouteRecord, key: string) => NavigationGuard | NavigationGuard[] | undefined
