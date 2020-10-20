import { Watcher } from './Watcher'
import { nextTick } from '../helper/next-tick'
import { Vue } from '@/core/Vue'
import { callHook } from '../helper/init';

let has: any = {}
// 表示目前队列中的Watcher是否全部执行过
let flushing = false
const queue: Watcher<Vue>[] = []
let index = 0
// 标志位，表示是否正在执行队列中的watcher
let waiting = false

export function queueWatcher(watcher: Watcher<Vue>) {
  const { id } = watcher
  // 对watcher.id做去重处理，对于同时触发queueWatcher的同一个watcher，只push一个进入队列中
  if (!has[id]) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }

    if (!waiting) {
      waiting = true
      // 等到同步任务
      nextTick(flushSchedulerQueue)
    }
  }
}


export let currentFlushTimestamp = 0
const getNow: () => number = Date.now
const activatedChildren: any[] = []

function flushSchedulerQueue() {
  currentFlushTimestamp = getNow()
  flushing = true

  queue.sort((a, b) => a.id - b.id)


  queue.every(watcher => {
    if (watcher.before) {
      watcher.before()
    }

    const id = watcher.id
    has[id] = null
    watcher.run()

    // TODO 可能出现循环更新
  })

  const updatedQueue = queue.slice()

  resetSchedulerState()

  callUpdatedHooks(updatedQueue)
}

function callUpdatedHooks(queue: Watcher<Vue>[]) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  waiting = flushing = false
}
