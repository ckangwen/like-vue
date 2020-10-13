import { Vue } from '@/core/Vue'
import { VueCtor } from '@/types';
import { initProps } from './props';
import { initSlots } from './slots';
import { createElement, initInternalComponent } from './resolve-components'


export default {
  install(Vue: VueCtor) {
    Vue.config.set('createElement', createElement)
    Vue.config.set('setOptions', initInternalComponent)

    Vue.mixin({
      beforeCreate(this: any) {
        const vm = this
        initSlots(vm)
      },
      created(this: Vue) {
        const vm = this
        if(vm.$options.props) {
          initProps(vm as any, vm.$options.props)
        }
      }
    })
  }
}
