import { Vue } from '@/core';

type PlainObject<T> = Record<string, T>

type LifecycleHook = Function[] | null
type LiftcycleEnum =
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

type DefaultData = PlainObject<any> | ((this: any) => object);
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
  props?: PropsType
  computed?: ComputedType
  watch?: WatchType
  methods?: Record<string, Function>
  render?: Function;

  components?: any[]

  name?: string;
} & ComponentLifecycleOptions
