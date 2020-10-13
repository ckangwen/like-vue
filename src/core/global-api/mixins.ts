import { VueCtor, ComponentOptions } from '@/types'
import { mergeOptions } from '@/core/helper';

export function initMixin (Vue: VueCtor): void {
  Vue.mixin = function (this: VueCtor, mixin: ComponentOptions) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
