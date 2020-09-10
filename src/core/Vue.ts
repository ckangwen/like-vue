import { Watcher } from './observe/Watcher';

let uid = 0

export class Vue {
  static cid: number
  options: any
  super?: Vue
  _watcher?: Watcher<Vue>
  _watchers?: Watcher<Vue>[]

  constructor(options: any) {
    this._watcher = undefined
    this._watchers = []
  }
}
