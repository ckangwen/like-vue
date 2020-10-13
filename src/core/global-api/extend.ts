import { ExtendAPIOption, VueCtor } from '@/types';
import { hasOwn, ASSET_TYPES, extend } from '@/shared';
import { mergeOptions } from '../helper/options';

export function initExtend(Vue: VueCtor): void {
  Vue.cid = 0
  let cid = 1
  Vue.extend = function(extendOptions: ExtendAPIOption = {}) {
    const Super = this
    const name = extendOptions.name || (Super as VueCtor).options.name
    const Sub = extendClass(Super, Super.prototype, (key) => {
      return ['extend', 'mixin', 'use', ...ASSET_TYPES].indexOf(key) > -1
    })
    Sub.super = Super

    Sub.cid = ++cid
    Sub.options = mergeOptions(Super.options || {}, extendOptions)
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)
    if (name) {
      Sub.options.components[name] = Sub;
    }
    return Sub
  }
}

/* helper */

const defaultValidatePropKeyFn = () => true

function extendClass(
  Super: Function,
  proto: any,
  some: ((key: string) => boolean) = defaultValidatePropKeyFn,
  before?: Function
): any {
  function VueComponent (this: any, ...args: any[]) {
    typeof before === 'function' && before.bind(this)()

    if (proto && proto.constructor) {
	    return proto.constructor.apply(this, ...args);
    } else {
      return Super.apply(this, ...args);
    }
  }

  VueComponent.prototype = Object.create(Super.prototype)
  VueComponent.prototype.constructor = VueComponent
  if (proto) {
    for (const key in proto) {
      if (hasOwn(proto, key)) {
        if (some(key)) {
          VueComponent.prototype[key] = proto[key]
        }
      }
    }
  }

  return VueComponent
}
