import { VNode } from '../vnode'
import { isDef, isObject } from '@/shared'
import { ModuleHooks } from '@/types';


function updateClass(oldVnode: VNode, vnode: VNode) {
  const el = vnode.elm
  const data = vnode.data
  const oldData = oldVnode.data

  if (
    !isDef(data.class) && (
    !isDef(oldData) || (!isDef(oldData.class))
    )
  ) {
    return
  }

  const cls = stringifyClass(data.class) as string

  (el as Element).setAttribute('class', cls)
}

const hookModule: ModuleHooks = {
  create: updateClass,
  update: updateClass
}

/********  class helper ********/

function stringifyClass (value: any): string {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

function stringifyArray (value: any[]): string {
  let res = ''
  let stringified
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' '
      res += stringified
    }
  }
  return res
}

function stringifyObject (value: any): string {
  let res = ''
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' '
      res += key
    }
  }
  return res
}

export default hookModule
