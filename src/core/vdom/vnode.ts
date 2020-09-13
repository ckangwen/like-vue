import { Vue } from '@/core/Vue'
import {
  VNodeData,
  VNodeChildren,
  Key,
  VueCtor,
  PlainObject,
  On
} from '@/types';

type VNodeCtorParams = {
  tag?: string;
  data?: VNodeData
  children?: VNodeChildren;
  text?: string;
  elm?: Node;
  key?: string | number;
  context?: any;
  componentOptions?: VNodeAdditionalOptions
}

type VNodeAdditionalOptions = {
  Ctor?: VueCtor
  tag?: string
  children?: VNode[]
  parent?: Vue
  propsData?: PlainObject<any>
  listeners?: On
}


export class VNode {
  tag: string;
  data: VNodeData;
  children: VNodeChildren;
  text: string;
  elm?: Node;
  context: any;
  isComment: boolean;
  key?: Key
  componentInstance: any
  componentOptions: VNodeAdditionalOptions = {}

  constructor({
    context,
    tag = '',
    data = {},
    children = [],
    text = '',
    elm,
    componentOptions = {}
  }: VNodeCtorParams) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
    this.isComment = false
    this.componentInstance = null
    this.componentOptions = componentOptions
  }
}

export function createTextVNode(text = '') {
  return new VNode({ text })
}

export function createEmptyVNode(text = '') {
  let vnode = new VNode({ text })
  vnode.isComment = true
  return vnode
}
