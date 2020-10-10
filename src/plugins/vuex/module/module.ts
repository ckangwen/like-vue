import { RawModule } from '../types/store';
import { forEachValue } from '../helper';

export class Module {
  state: any
  runtime: boolean
  _children: any
  _rawModule: RawModule

  constructor(rawModule: RawModule, runtime: boolean) {
    this.runtime = runtime
    this._children = Object.create(null)
    this._rawModule = rawModule
    const rawState = rawModule.state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  /**
   * 更新本模块中的各个状态
   */
  update(rawModule: RawModule) {
    this._rawModule.namespaced = rawModule.namespaced

    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }

  forEachGetter(fn: Function) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }
  forEachAction (fn: Function) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }
  forEachMutation (fn: Function) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}