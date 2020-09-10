import { VNode } from '../vnode'
import { isDef } from '@/shared'
import { ModuleHooks } from '@/types';

function updateEventListeners(oldVnode: VNode, vnode: VNode) {
  if (!oldVnode && !vnode) return
  if (!isDef(oldVnode.data.on) && !isDef(vnode.data?.on)) return

  const oldOn = oldVnode.data?.on || {}
  const on = vnode.data?.on || {}
  const oldElm = oldVnode.elm
  const elm = vnode.elm

  let name, listener

  if (!on) {
    for (name in oldOn) {
      listener = oldOn[name]
      oldElm!.removeEventListener(name, listener, false)
    }
  } else { // 存在新的事件监听器对象
    for (name in on) { // 添加监听器，存在于on但是不存在与oldOn
      if (!oldOn[name]) {
        listener = on[name]
        elm!.addEventListener(name, listener, false)
      }
    }
    for (name in oldOn) { // 移除oldOn上不存在于on上的监听器
      listener = oldOn[name]
      if (!on[name]) {
        oldElm!.removeEventListener(name, listener, false)
      }
    }
  }
}

const hookModule: ModuleHooks = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
}

export default hookModule
