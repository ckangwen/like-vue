import { globalConfig } from '@/core/config'
import { VueCtor } from '@/types'
import { __DEV__, deepset, ASSET_TYPES  } from '@/shared'
import { initUse } from './use'
import { initMixin } from './mixins'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del, observe, defineReactive } from '@/core/observe/Observe'

function setConfig(key: string, value: any) {
  if (key === 'set') {
    console.warn('Do not replace the set method')
    return
  }
  deepset(globalConfig, key, value)
}

export function initGlobalAPI(Vue: VueCtor): void {
  Vue.options = Object.create(null)
  Vue.options._base = Vue
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  const configDef: any = {}
  configDef.get = () => { return { ...globalConfig, set: setConfig } }
  if (__DEV__) {
    configDef.set = () => {
      console.warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }

  Object.defineProperty(Vue, 'config', configDef)

  initAssetRegisters(Vue)
  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)

  Vue.set = set
  Vue.delete = del
  Vue.observable = (obj: any) => {
    observe(obj)
    return obj
  }
  Vue.util = {
    defineReactive
  }
}
