import { Watcher } from './Watcher';
import { Vue } from '@/core'
import { remove } from '@/shared'

let uid = 0

export class Dep {
  static target?: Watcher<Vue> | null
  id: number
  subs: Watcher<any>[]

  constructor() {
    this.id = ++uid
    this.subs = []
  }

  addSub(sub: Watcher<any>) {
    this.subs.push(sub)
  }
  removeSub(sub: Watcher<any>) {
    remove(this.subs, sub)
  }

  /**
   * 将自身(Dep)添加到Watcher的deps
   *
   * */
  // TODO
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /**
   * 依赖的对象发生了变化，通知依赖进行更新
   * 遍历Watcher实例数组，调用update方法
   * */
  notify() {
    const subs = this.subs.slice()
    console.log(subs);
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null

export function pushTarget(target?: Watcher<Vue>) {
  Dep.target = target
}
export function popTarget() {
  Dep.target = null
}
