import { Vue } from '@/core/Vue'
import { isObject, __DEV__ } from '@/shared'

import { Commit, Dispatch, StoreOptions, CommitOptions, Payload } from './types/store';
import { assert, forEachValue, partial } from './helper';
import ModuleCollection from './module/module-collection';
import { Module } from './module/module';
export class Store {
  _committing: boolean
  _actions: any
  _wrappedGetters: any
  _watcherVM: any
  _moduleCollection: ModuleCollection
  _mutations: any
  strict: any;
  _vm: any;
  getters: any

  constructor(options: StoreOptions<any> = { plugins: [], strict: false }) {

    /* 是否在进行提交状态的标识 */
    this._committing = false
    /* acitons操作对象 */
    this._actions = Object.create(null)
    /* mutations操作对象 */
    this._mutations = Object.create(null)
    /* 封装后的getters集合对象 */
    this._wrappedGetters = Object.create(null)
    /* 存储分析后的modules */
    this._moduleCollection = new ModuleCollection(options)
    /* 订阅函数集合，Vuex提供了subscribe功能 */
    this._watcherVM = new Vue()

    const store = this
    const state = this._moduleCollection.root!.state
    const { dispatch, commit } = this

    /* 绑定作用域 */
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    installModule(this, this._moduleCollection.root!)

    resetStoreVM(this, state)
  }

  get state() {
    return this._vm._data.$$state
  }

  commit(_type: string, _payload?: any, _options?: CommitOptions) {
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const entry = this._mutations[type]

    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }

    this._withCommit(() => {
      entry.forEach(function commitIterator (handler: Function) {
        handler(payload)
      })
    })
  }

  dispatch(_type: string, _payload: any) {
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const entry = this._actions[type] as any[]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }

  _withCommit(fn: Function) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }

}




function unifyObjectStyle (type: string | Payload, payload: any, options?: any) {
  if (typeof type !== 'string' && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (__DEV__) {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type: type as string, payload, options }
}

function installModule (store: Store, module: Module, hot?: boolean) {
  /* 将mutation集中到state._mutations中集中管理 */
  module.forEachMutation((mutation: Function, key: string) => {
    const entry = store._mutations[key] || (store._mutations[key] = [])

    entry.push(
      function wrappedMutationHandler(payload: any) {
        mutation.call(store, module.state, payload)
      }
    )
  })

  module.forEachAction((mutation: Function, key: string) => {
    const entry = store._actions[key] || (store._actions[key] = [])

    entry.push(
      function wrappedActionHandler(payload: any) {
        mutation.call(store, {
          dispatch: store.dispatch,
          commit: store.commit,
          getters: store.getters,
          state: store.state
        }, payload)
      }
    )
  })

  module.forEachGetter((getter: Function, key: string) => {
    const entry = store._wrappedGetters[key]
    if (entry) {
      if (__DEV__) {
        console.error(`[vuex] duplicate getter key: ${key}`)
      }
      return
    }

    store._wrappedGetters[key] = function wrapperGetter() {
      return getter(store.state, store.getters)
    }
  })
}

function resetStoreVM(store: Store, state: any, hot?: boolean) {
  store.getters = {}
  const wrappedGetters = store._wrappedGetters

  const computed = {} as any

  forEachValue(wrappedGetters, (fn: Function, key: string) => {
    computed[key] = partial(fn, store)

    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
