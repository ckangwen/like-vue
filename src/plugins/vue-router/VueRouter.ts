import { BaseHistory } from './history/base';
import { Matcher } from './Matcher';
import { RawLocation, Route } from './types/router';
import { HashHistory } from './history/hash';
import { warn } from './utils/helper';
import { HTML5History } from './history/html5';

export class VueRouter {
  app: any
  apps: Array<any>
  options: any
  history: HashHistory | HTML5History
  matcher: any
  mode: 'hash' | 'history'

  constructor(options = {} as any) {
    this.app = null
    this.apps = []
    this.options = options
    this.matcher = new Matcher(options.routes || [], this)
    let mode = options.mode || 'hash'
    this.mode = mode
    this.history = null as any

    switch (mode) {
      case 'hash':
        this.history = new HashHistory(this, options.base)
        break;
      case 'history':
        this.history = new HTML5History(this, options.base)
        break;
      default:
        warn( `invalid mode: ${mode}`)
        break;
    }

  }

  match (raw: RawLocation, current?: Route, redirectedFrom?: Location): Route {
    return this.matcher.match(raw, current, redirectedFrom)
  }

  init() {
    const history = this.history
    const setupListeners = () => {
      history.setupListeners()
    }
    history.transitionTo(
      history.getCurrentLocation(),
      setupListeners,
      setupListeners
    )
  }
}