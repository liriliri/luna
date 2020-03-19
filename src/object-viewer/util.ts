import toStr from 'licia/toStr'
import trim from 'licia/trim'
import toNum from 'licia/toNum'
import startWith from 'licia/startWith'
import escape from 'licia/escape'

export const encode = (str: string) => {
  return escape(toStr(str))
    .replace(/\n/g, '↵')
    .replace(/\f|\r|\t/g, '')
}

export function getFnAbstract(str: string) {
  if (str.length > 500) str = str.slice(0, 500) + '...'

  return 'ƒ ' + trim(extractFnHead(str).replace('function', ''))
}

const regFnHead = /function(.*?)\((.*?)\)/

function extractFnHead(str: string) {
  const fnHead = str.match(regFnHead)

  if (fnHead) return fnHead[0]

  return str
}

// $, upperCase, lowerCase, _
export function sortObjName(a: string | Symbol, b: string | Symbol) {
  a = toStr(a)
  b = toStr(b)
  const numA = toNum(a)
  const numB = toNum(b)
  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA > numB) return 1
    if (numA < numB) return -1
    return 0
  }

  if (startWith(a, 'get ') || startWith(a, 'set ')) a = a.slice(4)
  if (startWith(b, 'get ') || startWith(b, 'set ')) b = b.slice(4)

  const lenA = a.length
  const lenB = b.length
  const len = lenA > lenB ? lenB : lenA

  for (let i = 0; i < len; i++) {
    const codeA = a.charCodeAt(i)
    const codeB = b.charCodeAt(i)
    const cmpResult = cmpCode(codeA, codeB)

    if (cmpResult !== 0) return cmpResult
  }

  if (lenA > lenB) return 1
  if (lenA < lenB) return -1

  return 0
}

function cmpCode(a: number, b: number) {
  a = transCode(a)
  b = transCode(b)

  if (a > b) return 1
  if (a < b) return -1
  return 0
}

function transCode(code: number) {
  // _ should be placed after lowercase chars.
  if (code === 95) return 123
  return code
}
