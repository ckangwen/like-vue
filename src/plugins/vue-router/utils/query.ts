import { Dictionary } from '../types/helper';
import { __DEV__, warn } from './helper';

const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = (str: string) =>
  encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ',')

const decode = decodeURIComponent

export function stringifyQuery (obj: Dictionary<any>): string {
  const res = obj
    ? Object.keys(obj)
      .map(key => {
        const val = obj[key]

        if (val === undefined) {
          return ''
        }

        if (val === null) {
          return encode(key)
        }

        if (Array.isArray(val)) {
          const result: string[] = []
          val.forEach(val2 => {
            if (val2 === undefined) {
              return
            }
            if (val2 === null) {
              result.push(encode(key))
            } else {
              result.push(encode(key) + '=' + encode(val2))
            }
          })
          return result.join('&')
        }

        return encode(key) + '=' + encode(val)
      })
      .filter(x => x.length > 0)
      .join('&')
    : null
  return res ? `?${res}` : ''
}


function parseQuery (query: string): Dictionary<string> {
  const res = {} as Dictionary<any>

  query = query.trim().replace(/^(\?|#|&)/, '')

  if (!query) {
    return res
  }

  query.split('&').forEach(param => {
    const parts = param.replace(/\+/g, ' ').split('=')
    const key = decode(parts.shift()!)
    const val = parts.length > 0 ? decode(parts.join('=')) : null

    if (res[key] === undefined) {
      res[key] = val
    } else if (Array.isArray(res[key])) {
      res[key].push(val)
    } else {
      res[key] = [res[key], val]
    }
  })

  return res
}

const castQueryParamValue = (value: any) => (value == null || typeof value === 'object' ? value : String(value))

export function resolveQuery (
  query?: string,
  extraQuery: Dictionary<any> = {},
  _parseQuery?: Function
): Dictionary<string> {
  const parse = _parseQuery || parseQuery
  let parsedQuery
  try {
    parsedQuery = parse(query || '')
  } catch (e) {
    __DEV__ && warn(e.message)
    parsedQuery = {}
  }
  for (const key in extraQuery) {
    const value = extraQuery[key]
    parsedQuery[key] = Array.isArray(value)
      ? value.map(castQueryParamValue)
      : castQueryParamValue(value)
  }
  return parsedQuery
}
