export const NavigationFailureType = {
  redirected: 2,
  aborted: 4,
  cancelled: 8,
  duplicated: 16
}

export function isError (err: any) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

function createRouterError (from: any, to: any, type: any, message: string) {
  const error = new Error(message) as any
  error._isRouter = true
  error.from = from
  error.to = to
  error.type = type

  return error
}

export function createNavigationRedirectedError (from: any, to: any) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.redirected,
    `Redirected when going from "${from.fullPath}" to "${stringifyRoute(
      to
    )}" via a navigation guard.`
  )
}

const propertiesToLog = ['params', 'query', 'hash']

function stringifyRoute (to: any) {
  if (typeof to === 'string') return to
  if ('path' in to) return to.path
  const location = {} as any
  propertiesToLog.forEach(key => {
    if (key in to) location[key] = to[key]
  })
  return JSON.stringify(location, null, 2)
}
