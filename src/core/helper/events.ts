import { Vue } from '../Vue';
import { On } from '@/types'
export function updateComponentListeners(vm: Vue, listeners: On = {}, oldListeners: On = {}) {
  updateListeners(
    listeners,
    oldListeners,
    (event: string, fn: Function) => {
      vm.$on(event, fn)
    },
    (event: string, fn: Function) => {
      vm.$off(event, fn)
    },
  )
}

function updateListeners(on: On, oldOn: On, add: Function, remove: Function) {
  let name, cur, old
  for(name in on) {
    cur = on[name]
    old = oldOn[name]
    if (!old) {
      add(name, cur)
    } else if (cur !== old) {
      on[name] = old
    }
  }

  for(name in oldOn) {
    if (!on[name]) {
      remove(name, oldOn[name])
    }
  }
}