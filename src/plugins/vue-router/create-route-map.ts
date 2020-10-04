import { pathToRegexp } from 'path-to-regexp'
import { RouteConfig, RouteRecord } from './types/router'
import { Dictionary } from './types/helper'
import { cleanPath } from './utils/path'

export function createRouteMap(
  routes: RouteConfig[],
  oldPathList: string[] = [],
  oldPathMap: Dictionary<RouteRecord> = Object.create(null),
  oldNameMap: Dictionary<RouteRecord> = Object.create(null),
) {
  const pathList = oldPathList
  const pathMap = oldPathMap
  const nameMap = oldNameMap

  routes.forEach(route => {
    addRouteRecord({
      pathList,
      pathMap,
      nameMap,
      route
    })
  })

  // 确保通配符路由总是在最后
  let index = pathList.indexOf('*')
  if (index > -1) {
    pathList.push(
      pathList.splice(index, 1)[0]
    )
  }

  return {
    pathList,
    pathMap,
    nameMap
  }

}

type AddRouteRecordParams = {
  pathList: Array<string>
  pathMap: Dictionary<RouteRecord>
  nameMap: Dictionary<RouteRecord>
  route: RouteConfig
  parent?: RouteRecord
  matchAs?: string
}

// TODO 未处理props
function addRouteRecord({
  route,
  pathList,
  pathMap,
  nameMap,
  parent,
  matchAs
}: AddRouteRecordParams) {
  const { path, name, component, components, redirect, meta = {}, props = {} } = route
  const normalizedPath = normalizePath(path, parent, false)

  const routeRecord: RouteRecord = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath),
    components: components || { default: component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect,
    meta,
    props: {}
  }

  if (route.children) {
    // TODO
  }

  if (!pathMap[path]) {
    pathList.push(path)
    pathMap[path] = routeRecord
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = routeRecord
    }
  }
}

/**
 * 如果路由配置是嵌套的，则子级路由配置的path需要加上父级的path
 */
function normalizePath(path: string, parent?: RouteRecord, strict?: boolean) {
  if (!strict) path = path.replace(/\/$/, '')
  // 绝对路径，直接返回
  if (path[0] === '/') return path
  // 一级路由，返回path
  if (!parent) return path
  // 子级路由，拼接父级的path
  return cleanPath(`${parent.path}/${path}`)
}

function compileRouteRegex(path: string) {
  if (path === '*') {
    return  /^((?:.*))(?:\/(?=$))?$/i
  }
  const regex = pathToRegexp(path, [], {})
  return regex
}