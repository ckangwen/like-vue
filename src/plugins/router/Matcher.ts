import { VueRouter } from './VueRouter';
import { RawLocation, Route, RouteConfig, RouteRecord, Location } from './types/router';
import { Dictionary } from './types/helper';
import { createRouteMap } from './create-route-map';
import { createRoute } from './utils/route';
import { normalizeLocation } from './utils/location';
import { fillParams } from './utils/params';

export class Matcher {
  pathList: string[]
  pathMap: Dictionary<RouteRecord>
  nameMap: Dictionary<RouteRecord>
  router: VueRouter


  constructor(routes: RouteConfig[], router: VueRouter) {
    const { pathList, pathMap, nameMap } = createRouteMap(routes)
    this.pathList = pathList
    this.pathMap = pathMap
    this.nameMap = nameMap
    this.router = router
  }

  match(raw: RawLocation, current: Route, redirectedFrom: Location) {
    const location = normalizeLocation(raw, current, false)
    const { name } = location

    if (name) {
      const record = this.nameMap[name]
      if (!record) {
        return this.createRoute(null, location)
      }

      const paramNames = (record.regex as any).keys
        .filter((key: any) => !key.optional)
        .map((key: any) => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }
      if (current && typeof current.params === 'object') {
        for (const key in current.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = current.params[key]
          }
        }
      }

      location.path = fillParams(record.path, location.params)
      return this.createRoute(record, location, redirectedFrom)
    }

    if (location.path) {
      for (let i = 0; i < this.pathList.length; i++) {
        const path = this.pathList[i]
        const record = this.pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return this.createRoute(record, location, redirectedFrom)
        }
      }
    }

    return this.createRoute(null, location)
  }

  private createRoute(
    record: RouteRecord | null,
    location?: Location,
    redirectedFrom?: Location
  ) {
    if (record && record.redirect) {
      // TODO return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      // TODO return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom)
  }
}

function matchRoute (
  regex: any,
  path: string,
  params?: Dictionary<any>
): boolean {
  const m = decodeURI(path).match(regex)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    if (key && key.name) {
      params[key.name] = m[i]
    }
  }

  return true
}