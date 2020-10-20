import { isObject } from '@/shared';
import { Observer } from './Observe';
const seenObjects = new Set<any>()

export function traverse(val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val: any, set: Set<any>) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    return
  }
  if (val.__ob__ && val.__ob__ instanceof Observer) {
    const depId = val.__ob__.dep.id
    if (set.has(depId)) {
      return
    }
    set.add(depId)
  }
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], set)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], set)
  }
}
