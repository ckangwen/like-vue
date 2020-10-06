import { Vue } from '@/core/Vue'
import { VNodeData, PlainObject, ComponentOptions } from '@/types';
import { camelize, isVnode } from '@/shared'
import { createElement, normalizeChildren, cloneVNode, VNode } from '@/core/vdom';
import { resolveSlots } from './slots';

export function createFunctionalComponent(
  Ctor: Vue,
  propsData: any,
  data: VNodeData,
  context: any,
  children?: VNode[]
) {
  const options = Ctor.options || {}
  const props = {} as any
  const propsOptions = options.props
  if (propsOptions) {
    for(const key in propsOptions) {
      props[key] = propsData[key]
    }
  } else {
    if (data.attrs) mergeProps(props, data.attrs)
    if (data.props) mergeProps(props, data.props)
  }

  const renderContext = new FunctionalRenderContext(
    data,
    props,
    context,
    Ctor,
    children,
  )

  const vnode = options.render?.call(null, renderContext.$createElement, renderContext)

  if (isVnode(vnode)) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  }

  // TODO 数组形式的vnode
  if (Array.isArray(vnode)) {
    const vnodes = normalizeChildren(vnode) || []
    const res = new Array(vnodes.length)
    for (let i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext)
    }
    return res
  }
  return null
}

function cloneAndMarkFunctionalResult (vnode: VNode, data: VNodeData, context: Vue, options: any, renderContext: any) {
  const clone = cloneVNode(vnode)
  clone.fnContext = context
  clone.fnOptions = options
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot
  }
  return clone
}

class FunctionalRenderContext {
  props: any;
  data: any;
  children: any[] | undefined;
  parent: any;
  listeners: any;
  $slots: Function;
  $options: ComponentOptions;
  $createElement: (a: any, b: any, c: any) => any;

  constructor(data: any, props: any, parent: any, Ctor: any, children?: any[]) {
    const options = Ctor.options

    this.data = data
    this.props = props
    this.children = children
    this.parent = parent
    this.listeners = data.on || Object.create(null)

    this.$slots = resolveSlots(children, parent)
    this.$options = options
    this.$createElement = (a: any, b: any, c: any) => createElement(parent, a, b, c)
  }
}

function mergeProps (to: PlainObject<any>, from: PlainObject<any>) {
  for (const key in from) {
    to[camelize(key)] = from[key]
  }
}
