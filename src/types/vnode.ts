import * as CSS from 'csstype'
import { VNode } from '@/core/vdom'
import { ModuleHookSet } from './patch-hook';
import { PlainObject } from './utils';

/* CSS */
export type CSSPropertiesKeys = keyof CSS.Properties
export type CssBodyDeclaration = {
  [x in CSSPropertiesKeys]?: string | number
}

export type Key = string | number

type NativeOn = {
  [N in keyof HTMLElementEventMap]?: (e: HTMLElementEventMap[N]) => void
}
export type On = NativeOn & {
  [event: string]: EventListener
}
export type VNodeStyle = CssBodyDeclaration


export type VNodeData = Partial<{
  key: Key;
  class: string | PlainObject<any>;
  tag: string;
  style: string | PlainObject<string>;
  props: PlainObject<any>;
  attrs: PlainObject<any>;
  on: On
  normalizedStyle: VNodeStyle
  hook: ModuleHookSet
  slot: any
}>

export type VNodeChildren = VNode | VNode[] | string | boolean | string[] | (VNode | string)[] |null
