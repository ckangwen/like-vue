export function assert (condition: boolean, msg: string) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}

export function forEachValue(obj: any, fn: Function) {
  Object.keys(obj).forEach(key => {
    fn(obj[key], key)
  })
}

export function partial (fn: Function, ...args: any[]) {
  return function () {
    return fn(...args)
  }
}