import { Vue } from '@/core';
import { PlainObject } from './utils';

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

export interface ComponentOptions extends UserComponentOptions {

}

export type VuePluginInstallType = (Vue: VueCtor, ...args: any[]) => void

export type VuePluginOptions = {
  install: VuePluginInstallType
} | VuePluginInstallType

export type VuePlugin = (plugin: VuePluginOptions, ...args: any[]) => VueCtor

export type VueMixin = (mixin: ComponentOptions) => VueCtor