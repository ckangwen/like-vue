import { Vue } from '@/core'
import { ComponentOptions } from '@/types'
import { hasOwn, LIFECYCLE_HOOKS, extend } from '@/shared'
import { globalConfig } from '../config'
import { VueCtor } from '../../types/vue';

const strategies = globalConfig.optionMergeStrategies

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

export function resolveConstructorOptions(Ctor: VueCtor) {
  let options = Ctor.options
  /* 如果有super属性，则表示是扩展类 */
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions

    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions || {}, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
    }

  }
  return options
}
function resolveModifiedOptions (Ctor: any) {
  let modified: any
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
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
