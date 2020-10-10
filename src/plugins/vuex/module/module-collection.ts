import { RawModule } from '../types/store';
import { Module } from './module';
import { __DEV__ } from '@/shared'
import { forEachValue } from '../helper';

// TODO 暂时仅设只有根模块
export default class ModuleCollection {
  root?: Module

  constructor(rawRootModule: RawModule) {
    this.register([], rawRootModule, false)
  }

  getModule(path: string[]) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root!)
  }

  getNamespace(path: string[]) {
    let module = this.root!
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

  register(path: string[], rawModule: RawModule, runtime: boolean = true) {
    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.getModule(path.splice(0, -1))
      parent.addChild(
        newModule,
        path[path.length - 1]
      )
    }

    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule: RawModule, key: string) => {
        this.register(
          path.concat(key),
          rawChildModule,
          runtime
        )
      })
    }
  }

  unregister(path: string[]) {
    const parent = this.getModule(path.slice(0, -1))
    const key = path[path.length - 1]
    const child = parent.getChild(key)

    if (!child) {
      if (__DEV__) {
        console.warn(
          `[vuex] trying to unregister module '${key}', which is ` +
          `not registered`
        )
      }
      return
    }

    if (!child.runtime) {
      return
    }

    parent.removeChild(key)
  }

  update(newModule: RawModule) {
    update([], this.root!, newModule)
  }

  isRegistered(path: string[]) {
    const parent = this.getModule(path.slice(0, -1))
    const key = path[path.length - 1]

    return !!parent.hasChild(key)
  }
}


function update(path: string[], targetModule: Module, newModule: RawModule) {
  targetModule.update(newModule)

  // 更新子模块
  if (newModule.modules) {
    // 遍历modules选项
    for (const key in newModule.modules) {
      // 如果targetModule不存在key模块，则不做操作
      if (!targetModule.getChild(key)) {
        if (__DEV__) {
          console.warn(
            `[vuex] trying to add a new module '${key}' on hot reloading, ` +
            'manual reload is needed'
          )
        }
        return
      }

      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      )

    }
  }
}
