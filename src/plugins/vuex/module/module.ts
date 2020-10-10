import { RawModule } from '../types/store';
import { forEachValue } from '../helper';

export class Module {
  state: any
  runtime: boolean
  /* 嵌套子模块 */
  _children: any
  /* module选项 */
  _rawModule: RawModule
  context: any;

  constructor(rawModule: RawModule, runtime: boolean) {
    this.runtime = runtime
    this._children = Object.create(null)
    this._rawModule = rawModule
    const rawState = rawModule.state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  get namespaced() {
    return this._rawModule.namespaced
  }

  addChild (module: Module, key: string) {
    this._children[key] = module
  }

  removeChild (key: string) {
    delete this._children[key]
  }

  getChild (key: string) {
    return this._children[key]
  }

  hasChild (key: string) {
    return key in this._children
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

  forEachChild (fn: Function) {
    forEachValue(this._children, fn)
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