import { Vue } from '@/core/Vue'
import { extend, __DEV__, warn } from '../utils/helper';

export const RouterView = {
  name: 'router-view',
  functional: true,
  props: {
    name: {
      type: String,
    }
  },
  render(h: Function, { children, parent, data, props }: any) {
    data.routerView = true
    const { name = 'default' } = props
    const route = parent.$route || parent._router
    const cache = parent._routerViewCache || (parent._routerViewCache = {})

    let depth = 0
    // 确定当前的视图深度
    while (parent && parent._routerRoot !== parent) {
      const vnodeData = parent.$vnode ? parent.$vnode.data : {}
      if (vnodeData.routerView) {
        depth++
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth

    const matched = route.matched[depth]
    const component = matched && matched.components[name] // name默认的default

    if (!matched || !component) {
      cache[name] = null
      return h()
    }

    cache[name] = { component }

    data.registerRouteInstance = (vm: Vue, val: any) => {
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }

    const configProps = matched.props && matched.props[name]
    if (configProps) {
      extend(cache[name], {
        route,
        configProps
      })
      fillPropsinData(component, data, route, configProps)
    }

    return h(component, data, children)
  }
}


function fillPropsinData (component: any, data: any, route: any, configProps: any) {
  // resolve props
  let propsToPass = data.props = resolveProps(route, configProps)
  if (propsToPass) {
    // clone to prevent mutation
    propsToPass = data.props = extend({}, propsToPass)
    // pass non-declared props as attrs
    const attrs = data.attrs = data.attrs || {}
    for (const key in propsToPass) {
      if (!component.props || !(key in component.props)) {
        attrs[key] = propsToPass[key]
        delete propsToPass[key]
      }
    }
  }
}

function resolveProps (route: any, config: any) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (__DEV__) {
        warn(
          `props in "${route.path}" is a ${typeof config}, ` +
          `expecting an object, function or boolean.`
        )
      }
  }
}
