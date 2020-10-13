import { RouteRecord, MatchedComponentConvertFn } from '../types';

export function flatten<T extends any = any> (arr: T[]) {
  return Array.prototype.concat.apply([], arr) as T extends any[] ? T : T[]
}

export function flatMapComponents(
  matched: RouteRecord[],
  fn: MatchedComponentConvertFn
) {
  return flatten(
    matched.map(m => {
      return Object.keys(m.components).map(name => {
        return fn(
          m.components[name],
          m.instances[name],
          m,
          name
        )
      })
    })
  )
}
