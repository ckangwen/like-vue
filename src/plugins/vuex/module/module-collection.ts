import { RawModule } from '../types/store';
import { Module } from './module';
import { __DEV__ } from '@/shared'

// TODO 暂时仅设只有根模块
export default class ModuleCollection {
  root?: Module

  constructor(rawRootModule: RawModule) {
    this.register([], rawRootModule, false)
  }

  register(path: string[], rawModule: RawModule, runtime: boolean = true) {
    const newModule = new Module(rawModule, runtime)
    this.root = newModule
  }

  unregister() {
    this.root = undefined
  }

  update (newModule: RawModule) {
    this.root!.update(newModule)
  }
}
