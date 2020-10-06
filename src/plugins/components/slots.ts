import { Vue } from '@/core/Vue'
import { VNode } from '@/core/vdom/vnode'

export function initSlots(vm: any) {
  const parentVnode = vm.$vnode = vm.$options.componentVnode
  const renderContext = parentVnode && parentVnode.context
  /* renderChildren在Vue构造函数初始化时被赋值为组件的子元素 */
  vm.$slots = resolveSlots(vm.$options.renderChildren, renderContext)
  vm.$scopedSlots = Object.create(null)
}

function resolveSlots(children: VNode[], context: Vue) {
  if (!children || children.length === 0) return {}

  const slots = {} as any
  children.forEach(child => {
    const data = child.data || {}

    if (child.context === context && data.slot) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      slot.push(child)
    } else {
      (slots.default || (slots.default = [])).push(child)
    }
  })

  /* 无需渲染注释节点和空白节点 */
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }

  return slots
}

function isWhitespace (node: VNode): boolean {
  return node.isComment || node.text === ' '
}
