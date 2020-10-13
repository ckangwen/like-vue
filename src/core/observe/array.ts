import { def } from '@/shared';
import { Observer } from './Observe';

const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function(method)  {
  def(arrayMethods, method, function(this: any, ...args: any[]) {
    const result = arrayMethods[method].apply(this, args)
    // 获取到Observer实例
    const ob: Observer = this.__ob__
    let inserted
    // 对于新增的内容也要进行响应式转换，否则会出现修改数据时无法触发消息的问题
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    ob?.dep.notify() // 数组改变之后，向依赖发送消息
    return result
  })
})
