import { RawLocation, Route, Location } from '../types/router';
import { extend } from './helper';
import { parsePath, resolvePath } from './path';
import { resolveQuery } from './query';

export function getLocation(base: string) {
  let path = window.location.pathname || '/'
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return path + window.location.search + window.location.hash
}

export function normalizeLocation (
  raw: RawLocation,
  current?: Route,
  append?: boolean,
): Location {
  let location: Location = typeof raw === 'string' ? { path: raw }: raw

  if (location._normalized) {
    return location
  }
  if (location.name) {
    location = extend({}, location)
    const { params } = location
    if (params && typeof params === 'object') {
      location.params = extend({}, params)
    }
    return location
  }

  const parsedPath = parsePath(location.path || '')
  const basePath = (current && current.path) || '/'
  const path = parsedPath.path ? resolvePath(parsedPath.path, basePath, append) : basePath
  const query = resolveQuery(parsedPath.query, location.query)
  let hash = location.hash || parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path,
    query,
    hash
  }
}