import { VNode } from '@/core/vdom'

export type PreHook = (vnode: VNode, parentEl: Node, refEl: Node) => any
export type InitHook = (vnode: VNode, hydrating?: boolean) => any
export type CreateHook = (emptyVNode: VNode, vnode: VNode) => any
export type InsertHook = (vnode: VNode) => any
export type PrePatchHook = (oldVNode: VNode, vnode: VNode) => any
export type UpdateHook = (oldVNode: VNode, vnode: VNode) => any
export type PostPatchHook = (oldVNode: VNode, vnode: VNode) => any
export type DestroyHook = (vnode: VNode, oldVnode: VNode) => any
export type RemoveHook = (vnode: VNode, removeCallback: () => void) => any
export type PostHook = () => any

export type ModuleHooks = Partial<{
  pre: PreHook
  init: InitHook
  create: CreateHook
  insert: InsertHook
  prepatch: PrePatchHook
  update: UpdateHook
  destroy: DestroyHook
  remove: RemoveHook
  post: PostHook
  postpatch: PostPatchHook
}>

export type ModuleHookEnum = keyof ModuleHooks

export type ModuleHookSet = { [T in ModuleHookEnum]?: Set<ModuleHooks[T]> }

