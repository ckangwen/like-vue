import { Vue } from '@/core/Vue';
import { PlainObject } from './utils';
import { VNode } from '../core/vdom/vnode';

export type VueCtor = typeof Vue

type LifecycleHook = Function[] | Function | null

export type LiftcycleEnum =
  | 'beforeCreate'
  | 'created'
  | 'beforeMount'
  | 'mounted'
  | 'beforeUpdate'
  | 'activated'
  | 'deactivated'
  | 'beforeDestroy'
  | 'destroyed'
  | 'errorCaptured'
export type ComponentLifecycleOptions = Partial<Record<LiftcycleEnum, LifecycleHook>>

type DefaultData = PlainObject<any> | Function
export type ComputedType = PlainObject<(Function | ComputedObjectType)>
export type ComputedObjectType = {
  get?: () => void;
  set?: (val?: any, oldVal?: any) => any;
  cache?: boolean
}
export type WatchType = PlainObject<(Function | WatchObjectOptions)>
export interface WatchObjectOptions {
  deep?: boolean;
  immediate?: boolean;
  handler: WatchHandler
}
export type WatchHandler = (this: Vue, val: any, oldVal: any) => void;
export type PropsType = string[] | PlainObject<PropsObjectOptions>
export interface PropsObjectOptions {
  type: any;
  required?: boolean;
  default?: any;
  validator?: (val: any) => boolean;
}


export type UserComponentOptions = {
  el?: string
  data?: DefaultData
  render?: Function;
  name?: string;
  [key: string]: any
} & ComponentLifecycleOptions

export type ExtendAPIOption = Omit<UserComponentOptions, 'el'>

export interface ComponentOptions extends UserComponentOptions {
  parent?: any
  _isComponent?: boolean
  componentVnode?: VNode & PlainObject<any>
  [key: string]: any
}

export type VuePluginInstallType = (Vue: VueCtor, ...args: any[]) => void

export type VuePluginOptions = {
  install: VuePluginInstallType
} | VuePluginInstallType

export type VueAssetEnum = 'component'

export type VuePlugin = (plugin: VuePluginOptions, ...args: any[]) => VueCtor

export type VueMixin = (mixin: ComponentOptions) => VueCtor

export type VueExtend = (options: ExtendAPIOption) => VueCtor

export type VueSetType = (target: any, key: string | number, value: any) => any
export type VueDeleteType = (target: any, key: string | number) => void
export type VueObservableType = (obj: any) => any
export type VueUtilType = {
  defineReactive: (
    obj: Record<string, any>,
    key: string,
    val?: any,
    customSetter?: PropertyDescriptor['set'],
    shallow?: boolean
  ) => any
}
