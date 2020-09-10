export type UserWatcherOptions = {
  deep?: boolean
}

export type CtorWatcherOptions = {
  deep?: boolean
  user?: boolean
  lazy?: boolean
  sync?: boolean
  before?(): Function
}
