import upperFirst from 'licia/upperFirst'

export function getObjType(obj: any) {
  if (obj.constructor && obj.constructor.name) return obj.constructor.name

  return upperFirst({}.toString.call(obj).replace(/(\[object )|]/g, ''))
}
