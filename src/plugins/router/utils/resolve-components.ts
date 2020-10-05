import { RouteRecord } from '../types/router';

export function flatten (arr: any[]): any[] {
  return Array.prototype.concat.apply([], arr)
}
