import { VNode } from '../vnode'
import { isDef } from '@/shared'
import { ModuleHooks } from '@/types';

function updateAttrs(oldVnode: VNode, vnode: VNode) {
  if (!isDef(oldVnode.data?.attrs) && !isDef(vnode.data?.attrs)) return

  const oldAttrs = oldVnode.data?.attrs || {}
  const attrs = vnode.data?.attrs || {}
  const el = vnode.elm as Element

  if (oldAttrs === attrs) return
  let key, cur, old

  // 遍历新节点的attrs
  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    // 如果前后两个属性值不一致，则更新为新的属性值
    if (old !== cur) {
      setAttr(el, key, cur)
    }
  }

  // 遍历旧节点的oldAttrs
  for (key in oldAttrs) {
    // 如果旧节点中的属性未在新节点中定义，则移除
    if (!isDef(attrs[key])) {
      if (!isEnumeratedAttr(key)) {
        el.removeAttribute(key)
      }
    }
  }
}
const hookModule: ModuleHooks = {
  create: updateAttrs,
  update: updateAttrs
}

/********** attribute helper  **********/
function setAttr (el: Element, key: string, value: any) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value)
  } else if (isBooleanAttr(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key
      el.setAttribute(key, value)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value))
  }  else {
    baseSetAttr(el, key, value)
  }
}

function baseSetAttr (el: Element, key: string, value: any) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}

/********* ********/
const isBooleanAttr = (key: string): boolean => [
  'allowfullscreen', 'async',         'autofocus',
  'autoplay',        'checked',       'compact',
  'controls',        'declare',       'default',
  'defaultchecked',  'defaultmuted',  'defaultselected',
  'defer',           'disabled',      'enabled',
  'formnovalidate',  'hidden',        'indeterminate',
  'inert',           'ismap',         'itemscope',
  'loop',            'multiple',      'muted',
  'nohref',          'noresize',      'noshade',
  'novalidate',      'nowrap',        'open',
  'pauseonexit',     'readonly',      'required',
  'reversed',        'scoped',        'seamless',
  'selected',        'sortable',      'translate',
  'truespeed',       'typemustmatch', 'visible'
].indexOf(key) > -1

const isFalsyAttrValue = (val: any): boolean => val === false || !isDef(val)

const isEnumeratedAttr = (a: string) => [ 'contenteditable', 'draggable', 'spellcheck' ].indexOf(a) > -1

const isValidContentEditableValue = (a: string): boolean => [ 'events', 'caret', 'typing', 'plaintext-only' ].indexOf(a) > -1

const convertEnumeratedValue = (key: string, value: any) => {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
}

export default hookModule