import map from 'licia/map'
import trim from 'licia/trim'

export function classPrefix(name: string) {
  const prefix = `luna-${name}-`
  return function (str: string) {
    return map(
      trim(str).split(/\s+/),
      (singleClass) => `${prefix}${singleClass}`
    ).join(' ')
  }
}
