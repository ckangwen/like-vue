import { VueCtor } from '@/types'
import { Vue } from '@/core/Vue';
import computedPlugin from '@/plugins/computed';

export function install(Vue: VueCtor) {
  Vue.use(computedPlugin)

  Vue.mixin({
    beforeCreate(this: any) {
      const vm: Vue = this
      const options = this.$options
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    }
  })
}
