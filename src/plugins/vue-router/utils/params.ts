import { compile } from 'path-to-regexp'
import { Dictionary } from '../types/helper';

const regexpCompileCache: {
  [key: string]: Function
} = Object.create(null)

export function fillParams (
  path: string,
  params: Dictionary<any> = {}
): string {
  try {
    const filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = compile(path))

    return filler(params, { encode: encodeURIComponent })
  } catch (e) {
    return ''
  } finally {
    delete params[0]
  }
}