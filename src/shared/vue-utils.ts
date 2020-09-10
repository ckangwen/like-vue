/**
 * 检查是否以_或$开头
 */
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export const __DEV__ = process.env.NODE_ENV !== 'production'


const HTMLTag = [
  'html',    'body',    'base',
  'head',    'link',    'meta',
  'style',   'title',   'address',
  'article', 'aside',   'footer',
  'header',  'h1',      'h2',
  'h3',      'h4',      'h5',
  'h6',      'hgroup',  'nav',
  'section', 'div',     'dd',
  'dl',      'dt',      'figcaption',
  'figure',  'picture', 'hr',
  'img',     'li',      'main',
  'ol',      'p',       'pre',
  'ul',    'blockquote', 'iframe',  'tfoot',
  'a',        'b',          'abbr',    'bdi',     'bdo',
  'br',       'cite',       'code',    'data',    'dfn',
  'em',       'i',          'kbd',     'mark',    'q',
  'rp',       'rt',         'rtc',     'ruby',    's',
  'samp',     'small',      'span',    'strong',  'sub',
  'sup',      'time',       'u',       'var',     'wbr',
  'area',     'audio',      'map',     'track',   'video',
  'embed',    'object',     'param',   'source',  'canvas',
  'script',   'noscript',   'del',     'ins',     'caption',
  'col',      'colgroup',   'table',   'thead',   'tbody',
  'td',       'th',         'tr',      'button',  'datalist',
  'fieldset', 'form',       'input',   'label',   'legend',
  'meter',    'optgroup',   'option',  'output',  'progress',
  'select',   'textarea',   'details', 'dialog',  'menu',
  'menuitem', 'summary',    'content', 'element', 'shadow',
  'template'
]

export const isHTMLTag = (tag: string) => {
  return HTMLTag.indexOf(tag) > -1
}

export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      __DEV__ && console.warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}
