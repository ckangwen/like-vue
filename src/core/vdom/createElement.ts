import { Vue } from '@/core/Vue'
import { VNode, createTextVNode, createEmptyVNode } from './vnode'
import { globalConfig } from '@/core/config'
import { VNodeData, VNodeChildren } from '@/types'
import {
  isHTMLTag,
  isDef,
  __DEV__,
  isPrimitive
} from '@/shared'

export function createElement(context: Vue, tag: any): VNode
export function createElement(context: Vue, tag: any, data: VNodeData | null): VNode
export function createElement(context: Vue, tag: any, children?: VNodeChildren): VNode
export function createElement(context: Vue, tag: any, data: VNodeData | null, children?: VNodeChildren): VNode
export function createElement(
  context: Vue,
  tag?: string,
  data?: any,
  children?: any
): VNode | null | undefined {
  /* 没有传入data */
  if (Array.isArray(data) || isPrimitive(data)) {
    children = data
    data = undefined
  }

  if (!tag) return createTextVNode()

  children = normalizeChildren(children) as VNode[]

  let vnode
  if (typeof tag === 'string' && isHTMLTag(tag)) {
    vnode = new VNode({
      context,
      tag,
      data,
      children
    })
  } else {
    if (globalConfig.createElement) {
      vnode = globalConfig.createElement(context, tag, data, children)
    }
  }

  if (isDef(vnode)) {
    return vnode
  } else {
    return createEmptyVNode()
  }
}

/**
 * 校验子组件是否符合规范
 */
export function normalizeChildren(children: VNodeChildren) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}
/**
 * 省略了合并相邻文本节点的过程
 */
function normalizeArrayChildren(children: VNodeChildren[], nestedIndex: string = ''): any[] {
  return children.map((child, i) => {
    if (!isDef(child) || typeof child === 'boolean') return null
    if (isPrimitive(child)) {
      return createTextVNode(child)
    } else if (Array.isArray(child)) {
      return normalizeArrayChildren(child, `${nestedIndex}_${i}`)
    } else {
      // TODO 如果是v-for的情况
      return child
    }
  })
}