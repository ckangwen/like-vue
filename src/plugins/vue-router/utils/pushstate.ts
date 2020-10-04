import { getStateKey, setStateKey, genStateKey } from './time';
import { extend } from './helper';

export function pushState(url?: string, replace?: boolean) {
  const history = window.history
  try {
    if (replace) {
      // 不对history.state本身进行修改
      const stateCopy = extend({}, history.state)
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url!)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
