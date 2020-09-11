import { Vue } from '@/core'
import { VuePluginOptions, VueCtor } from '@/types'

export function initUse(Vue: VueCtor) {
  Vue.use = function(this: VueCtor, plugin: VuePluginOptions, ...args: any[]) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    if (typeof plugin === 'function') {
      plugin.call(null, this, ...args)
    } else if (typeof plugin.install === 'function') {
      plugin.install.call(plugin, this, ...args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
