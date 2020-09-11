import { globalConfig } from '@/core';
import { VueCtor } from '@/types'
import { __DEV__, deepset } from '@/shared';
import { initUse } from './use';
import { initMixin } from './mixins';

function setConfig(key: string, value: any) {
  if (key === 'set') {
    console.warn('Do not replace the set method')
    return
  }
  deepset(globalConfig, key, value)
}

export function initGlobalAPI(Vue: VueCtor) {
  Vue.options = Object.create(null)

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

  initUse(Vue)
  initMixin(Vue)
}
