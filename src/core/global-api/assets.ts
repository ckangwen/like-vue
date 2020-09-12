import { ASSET_TYPES } from '@/shared';
import { isPlainObject, __DEV__ } from '@/shared';
import { VueCtor, VueAssetEnum } from '@/types';

export function initAssetRegisters(Vue: VueCtor) {
  ASSET_TYPES.forEach((type: VueAssetEnum) => {
    Vue[type] = function (id: string, definition?: any) {
      if (!definition) return this.options[type + 's'][id]
      if (type === 'component' && isPlainObject(definition)) {
        definition.name = definition.name || id
        definition = this.options._base.extend(definition)
      }

      this.options[type + 's'][id] = definition
      return definition
    }
  })
}
