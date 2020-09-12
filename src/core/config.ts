export type GlobalConfig = {
  optionMergeStrategies: {
    [key in string]?: Function
  }
  createElement?: Function
}

export const globalConfig: GlobalConfig = {
  optionMergeStrategies: Object.create(null),
}