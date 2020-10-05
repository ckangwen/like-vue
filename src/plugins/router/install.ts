import { __DEV__, noop, extend } from '@/shared'
import { VueCtor } from '@/types'
import { RouterView } from './components/view';

export let _Vue: any

export const install = function (Vue: VueCtor) {
  if ((install as any).installed && _Vue === Vue) return
  (install as any).installed = true

  _Vue = Vue

  const registerInstance = (vm: any, callVal: any) => {
    let hook = vm.$options._parentVnode?.data?.registerRouteInstance
    typeof hook === 'function' && hook(vm, callVal) // callVal作为component instance插入route.matched.instances
  }

  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        this._route = this._router.history.current
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }

      registerInstance(this, this)
    }
  })


  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('router-view', RouterView)

}