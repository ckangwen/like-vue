import { VNodeData, PlainObject } from '@/types'
import { hasOwn, hyphenate, isDef } from '@/shared'

export function extractPropsFromVNodeData(data: VNodeData, Ctor: any, tag?: string) {
  const propOptions = Ctor.options.props
  if (!propOptions) return

  const res = {}
  const { attrs = {}, props = {} } = data
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key)

      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false)
    }
  }
  return res
}


function checkProp (
  res: PlainObject<any>,
  hash: Object,
  key: string,
  altKey: string,
  preserve: boolean
): boolean {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}
