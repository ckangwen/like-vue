import { Vue } from '@/core/Vue'
import { isObject, __DEV__ } from '@/shared'

import { LocalContext, StoreOptions, CommitOptions, Payload, RawModule } from './types/store';
import { assert, forEachValue, partial } from './helper';
import ModuleCollection from './module/module-collection';
import { Module } from './module/module';
import { isPromise } from '../../shared/is';


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
  _makeLocalGettersCache: any;
  _modulesNamespaceMap: any;

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
    this._modulesNamespaceMap = Object.create(null)
    this._makeLocalGettersCache = Object.create(null)

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

    installModule(this, state, [], this._moduleCollection.root!)

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

function installModule (store: Store, rootState: any ,path: string[], module: Module, hot?: boolean) {
  const isRoot = !path.length
  const namespace = store._moduleCollection.getNamespace(path)

  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
  }

  /* 设置子模块中的state */
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]

    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      /* key为模块名，值为模块的state */
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  /* 将mutation集中到state._mutations中集中管理 */
  module.forEachMutation((mutation: Function, key: string) => {
    const namespacedType = namespace + key

    const entry = store._mutations[namespacedType] || (store._mutations[namespacedType] = [])

    entry.push(
      function wrappedMutationHandler(payload: any) {
        mutation.call(store, local.state, payload)
      }
    )
  })

  module.forEachAction((mutation: Function, key: string) => {
    const namespacedType = namespace + key
    const entry = store._actions[namespacedType] || (store._actions[namespacedType] = [])

    entry.push(
      function wrappedActionHandler(payload: any) {
        let res = mutation.call(store, {
          dispatch: local.dispatch,
          commit: local.commit,
          getters: local.getters,
          state: local.state,
          rootGetters: store.getters,
          rootState: store.state
        }, payload)

        if (!isPromise(res)) {
          // 转换为异步
          res = Promise.resolve(res)
        }
        return res
      }
    )
  })

  module.forEachGetter((getter: Function, key: string) => {
    const namespacedType = namespace + key
    const entry = store._wrappedGetters[namespacedType]
    if (entry) {
      if (__DEV__) {
        console.error(`[vuex] duplicate getter key: ${key}`)
      }
      return
    }

    store._wrappedGetters[namespacedType] = function wrapperGetter() {
      return getter(
        local.state,
        local.getters,
        store.state,
        store.getters
      )
    }
  })

  /* 处理子模块 */
  module.forEachChild((child: Module, key: string) => {
    installModule(store, rootState, path.concat(key), child, hot)
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

function makeLocalContext(store: Store, namespace: string, path?: string[]): LocalContext {
  const noNamespace = namespace === ''

  const local = {
    commit: noNamespace ? store.commit : (_type: string, _payload: any, _options: any) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    },
    dispatch: noNamespace ? store.dispatch : (_type: string, _payload: any, _options: any) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? () => store.getters : () => makeLocalGetters(store, name)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local as LocalContext
}

function makeLocalGetters(store: Store, namespace: string) {
  if (store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length // 带命名空间的模块的模块名
    Object.keys(store.getters).forEach((type: string) => {
      // 不是以该模块名起始的getter,即不是该模块中的getter
      if (type.slice(0, splitPos) !== namespace) return

      const localType = type.slice(splitPos)

      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })
    store._makeLocalGettersCache[namespace] = gettersProxy

  }

  return store._makeLocalGettersCache[namespace]
}

function getNestedState(state: any, path?: string[]) {
  if (!path) return
  return path.reduce((state, key) => {
    return state[key]
  }, state)
}
