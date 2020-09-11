export type GlobalConfig = {
  optionMergeStrategies: {
    [key in string]?: Function
  }
}

export const globalConfig: GlobalConfig = {
  optionMergeStrategies: Object.create(null)
}