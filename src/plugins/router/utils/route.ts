import { Route, Location, RouteRecord } from '../types/router';
import { clone } from './helper';
import { stringifyQuery } from './query';

export function createRoute(
  record: RouteRecord | null,
  location?: Location,
  redirectedFrom?: Location
) {
  const query = clone(location?.query || {})
  const route: Route = {
    name: location?.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location?.path || '/',
    hash: location?.hash || '',
    query,
    params: location?.params || {},
    fullPath: getFullPath(location),
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom)
  }
  return Object.freeze(route)
}

export const START = createRoute(null, {
  path: '/'
})

function getFullPath({ path = '/', query = {}, hash = '' }: Location = {}) {
  return path + stringifyQuery(query) + hash
}

function formatMatch (record?: RouteRecord): RouteRecord[] {
  const res = []
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}

