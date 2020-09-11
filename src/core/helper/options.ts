import { Vue } from '@/core'
import { ComponentOptions } from '@/types'
import { hasOwn, LIFECYCLE_HOOKS } from '@/shared'
import { globalConfig } from '../config'

let strategies = globalConfig.optionMergeStrategies

LIFECYCLE_HOOKS.forEach(hook => {
  strategies[hook] = mergeHook
})

const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

export function mergeOptions(parent: ComponentOptions = {}, child: ComponentOptions = {}, vm?: Vue) {
  const options: ComponentOptions = {}
  let key: keyof ComponentOptions
  for(key in parent) {
    mergeField(key)
  }
  for(key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField (key: keyof ComponentOptions) {
    const strat = strategies[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

function mergeHook(
  parent: Function[] | Function,
  child: Function[] | Function
) {
  parent = parent ? Array.isArray(parent) ? parent : [parent] : parent
  child = child ? Array.isArray(child) ? parent : [child] : child
  const res = child
    ? parent
      ? parent.concat(child)
      : child
    : parent

  return res ? [...new Set<Function>(res)] : res
}
