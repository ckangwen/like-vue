
export let isUsingMicroTask = false

const callbacks: Function[] = []
let pending = false

function flushCallbacks() {
  pending = true
  const copies = callbacks.slice(0)
  // 清空callbacks
  callbacks.length = 0
  copies.forEach(item => {
    item()
  })
}

const timerFunc = () => {
  Promise
    .resolve()
    .then(flushCallbacks)

  // Promise.then属于微任务
  isUsingMicroTask = true
}

export function nextTick(cb?: Function, ctx?: any) {
  let _resolve: Function
  callbacks.push(
    () => {
      if (cb) {
        try {
          // cb不可以是箭头函数，箭头函数的this是固定的，是不可用apply,call,bind来改变的
          cb.call(ctx)
        } catch (e) {
          console.error('nextTick', e)
        }
      } else if (_resolve) {
        _resolve(ctx)
      }
    }
  )

  if (!pending) {
    pending = true
    timerFunc()
  }

  if (!cb && typeof Promise !== undefined) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
