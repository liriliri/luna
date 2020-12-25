import map from 'licia/map'
import trim from 'licia/trim'
import root from 'licia/root'

export function classPrefix(name: string) {
  const prefix = `luna-${name}-`
  return function (str: string) {
    return map(
      trim(str).split(/\s+/),
      (singleClass) => `${prefix}${singleClass}`
    ).join(' ')
  }
}

const hasTouchSupport = 'ontouchstart' in root
const touchEvents: any = {
  start: 'touchstart',
  move: 'touchmove',
  end: 'touchend',
}
const mouseEvents: any = {
  start: 'mousedown',
  move: 'mousemove',
  end: 'mouseup',
}

export function drag(name: string) {
  return hasTouchSupport ? touchEvents[name] : mouseEvents[name]
}

export function eventClient(type: string, e: any) {
  const name = type === 'x' ? 'clientX' : 'clientY'

  if (e[name]) {
    return e[name]
  }
  if (e.changedTouches) {
    return e.changedTouches[0][name]
  }

  return 0
}
