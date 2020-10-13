import { BaseHistory } from "./base";

export class HTML5History extends BaseHistory {
  constructor(router: any, base = '/', fallback?: Function) {
    super(router, base)
  }
  getCurrentLocation (): string {
    return getLocation(this.base)
  }
}

export function getLocation (base: string): string {
  let path = window.location.pathname
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}