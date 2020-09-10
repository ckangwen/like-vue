export function isPrimitive (s: any): s is (string | number) {
  return typeof s === 'string' || typeof s === 'number'
}

export function isDef(c: any): boolean {
  return c !== undefined && c !== null
}

export function isVnode (vnode: any): boolean {
  return vnode.tag !== undefined || isDef(vnode.text)
}


export function isObject (value: any): value is Object {
  return value !== null && typeof value === 'object'
}

export function isPromise (val: any): boolean {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export function isFunction(value: any): value is Function {
  if (!value) return false
  return typeof value === 'function'
}

export function isElement(value: any): value is Element {
  if (!value) return false
  return value instanceof Element
}

export function isPlainObject (obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}