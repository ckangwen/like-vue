import { BaseHistory } from './base';
import { pushState, replaceState } from '../utils/pushstate';
import { RawLocation, Route } from '../types/router';
export class HashHistory extends BaseHistory {
  constructor(router: any, base: string = '/', fallback?: Function) {
    super(router, base)
    ensureSlash()
  }

  getCurrentLocation() {
    return getHash()
  }

  ensureURL (push?: boolean) {
    const fullpath = this.current.fullPath
    if (getHash() !== fullpath) {
      push ? pushState(getUrlWithHash(fullpath)) : replaceState(getUrlWithHash(fullpath))
    }
  }

  go (n: number) {
    window.history.go(n)
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.transitionTo(
      location,
      (route: Route) => {
        pushState(getUrlWithHash(route.fullPath))
        onComplete && onComplete(route)
      },
      onAbort
    )
  }
}

function ensureSlash (): boolean {
  const path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  replaceState(getUrlWithHash('/' + path))
  return false
}


export function getHash (): string {
  let href = window.location.href
  const index = href.indexOf('#')
  if (index < 0) return ''

  href = href.slice(index + 1)

  return href
}

function getUrlWithHash (path: string) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}