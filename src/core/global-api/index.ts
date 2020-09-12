import { globalConfig } from '@/core/config'
import { VueCtor } from '@/types'
import { __DEV__, deepset, ASSET_TYPES  } from '@/shared'
import { initUse } from './use'
import { initMixin } from './mixins'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'

function setConfig(key: string, value: any) {
  if (key === 'set') {
    console.warn('Do not replace the set method')
    return
  }
  deepset(globalConfig, key, value)
}

export function initGlobalAPI(Vue: VueCtor) {
  Vue.options = Object.create(null)
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
}
