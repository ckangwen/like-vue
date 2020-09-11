export type GlobalConfig = {
  optionMergeStrategies: {
    [key in string]?: Function
  }
}

export const config: GlobalConfig = {
  optionMergeStrategies: Object.create(null)
}