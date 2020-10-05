import { Dictionary } from '../types/helper';

export function clone (value: Dictionary<any>): Dictionary<any> {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    const res = {} as Dictionary<any>
    for (const key in value) {
      res[key] = clone(value[key])
    }
    return res
  } else {
    return value
  }
}

export function isObjectEqual (a = {} as any, b = {} as any): boolean {
  // handle null value #1566
  if (!a || !b) return a === b
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(key => {
    const aVal = a[key]
    const bVal = b[key]
    // query values can be null and undefined
    if (aVal == null || bVal == null) return aVal === bVal
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}

export const __DEV__ = process.env.NODE_ENV !== 'production'

export function warn (message: string) {
  if (__DEV__) {
    typeof console !== 'undefined' && console.warn(`[vue-router] ${message}`)
  }
}

export function extend (a: Dictionary<any>, b: Dictionary<any>) {
  for (const key in b) {
    a[key] = b[key]
  }
  return a
}

export const inBrowser = typeof window !== 'undefined'
