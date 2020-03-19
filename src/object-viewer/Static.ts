import $ from 'licia/$'
import startWith from 'licia/startWith'
import isObj from 'licia/isObj'
import uniqId from 'licia/uniqId'
import upperFirst from 'licia/upperFirst'
import toNum from 'licia/toNum'
import chunk from 'licia/chunk'
import each from 'licia/each'
import isNaN from 'licia/isNaN'
import isNum from 'licia/isNum'
import isBool from 'licia/isBool'
import isStr from 'licia/isStr'
import keys from 'licia/keys'
import lowerCase from 'licia/lowerCase'
import Emitter from 'licia/Emitter'
import { encode, sortObjName, getFnAbstract } from './util'

const classPrefix = 'luna-object-viewer-'

export default class JsonViewer extends Emitter {
  private data: any
  private $container: $.$
  private map: any
  constructor(container: Element) {
    super()

    this.$container = $(container)
    this.$container.addClass('luna-object-viewer')

    this.bindEvent()
  }
  set(data: any) {
    if (isStr(data)) data = JSON.parse(data)

    this.data = {
      id: uniqId('json'),
      enumerable: {
        0: data
      }
    }
    this.map = {}

    createMap(this.map, this.data)

    this.appendTpl()
  }
  private objToHtml(data: any, firstLevel?: boolean) {
    let ret = ''

    each(['enumerable', 'unenumerable', 'symbol'], type => {
      if (!data[type]) return

      const typeKeys = keys(data[type])
      typeKeys.sort(sortObjName)
      for (let i = 0, len = typeKeys.length; i < len; i++) {
        const key = typeKeys[i]
        ret += this.createEl(key, data[type][key], type, firstLevel)
      }
    })

    if (data.proto) {
      if (ret === '') {
        ret = this.objToHtml(data.proto)
      } else {
        ret += this.createEl('__proto__', data.proto, 'proto')
      }
    }

    return ret
  }
  private createEl(key: string, val: any, keyType: string, firstLevel = false) {
    let type: any = typeof val

    if (val === null) {
      return `<li>${wrapKey(
        key
      )}<span class="${classPrefix}null">null</span></li>`
    } else if (isNum(val) || isBool(val)) {
      return `<li>${wrapKey(key)}<span class="${classPrefix + type}">${encode(
        val
      )}</span></li>`
    }

    if (val.type === 'RegExp') type = 'regexp'
    if (val.type === 'Number') type = 'number'

    if (val.type === 'Number' || val.type === 'RegExp') {
      return `<li>${wrapKey(key)}<span class="${classPrefix + type}">${encode(
        val.value
      )}</span></li>`
    } else if (val.type === 'Undefined' || val.type === 'Symbol') {
      return `<li>${wrapKey(
        key
      )}<span class="${classPrefix}special">${lowerCase(val.type)}</span></li>`
    } else if (val === '(...)') {
      return `<li>${wrapKey(
        key
      )}<span class="${classPrefix}special">${val}</span></li>`
    } else if (isObj(val)) {
      const id = val.id
      const referenceId = val.reference
      const objAbstract = getObjAbstract(val) || upperFirst(type)

      let obj = `<li ${
        firstLevel ? 'data-first-level="true"' : ''
      } ${'data-object-id="' + (referenceId || id) + '"'}><span class="${
        firstLevel ? '' : `${classPrefix}expanded ${classPrefix}collapsed`
      }"></span>${wrapKey(key)}<span class="${classPrefix}open">${
        firstLevel ? '' : objAbstract
      }</span><ul class="${classPrefix + type}" ${
        firstLevel ? '' : 'style="display:none"'
      }>`

      if (firstLevel) obj += this.objToHtml(this.map[id])

      return obj + `</ul><span class="${classPrefix}close"></span></li>`
    }

    function wrapKey(key: string) {
      if (firstLevel) return ''
      if (isObj(val) && val.jsonSplitArr) return ''

      let keyClass = `${classPrefix}key`
      if (
        keyType === 'unenumerable' ||
        keyType === 'proto' ||
        keyType === 'symbol'
      ) {
        keyClass = `${classPrefix}key-lighter`
      }

      return `<span class="${keyClass}">${encode(key)}</span>: `
    }

    return `<li>${wrapKey(key)}<span class="${classPrefix +
      typeof val}">"${encode(val)}"</span></li>`
  }
  private appendTpl() {
    const data = this.map[this.data.id]

    this.$container.html(this.objToHtml(data, true))
  }
  private bindEvent() {
    const self = this

    this.$container.on('click', 'li', function(this: Element, e: any) {
      const map = self.map
      const $this = $(this)
      const circularId = $this.data('object-id')
      const $firstSpan: any = $(this)
        .find('span')
        .eq(0)

      if ($this.data('first-level')) return
      if (circularId) {
        $this.find('ul').html(self.objToHtml(map[circularId], false))
        $this.rmAttr('data-object-id')
      }

      e.stopImmediatePropagation()

      if (!$firstSpan.hasClass(`${classPrefix}expanded`)) return

      const $ul: any = $this.find('ul').eq(0)
      if ($firstSpan.hasClass(`${classPrefix}collapsed`)) {
        $firstSpan.rmClass(`${classPrefix}collapsed`)
        $ul.show()
      } else {
        $firstSpan.addClass(`${classPrefix}collapsed`)
        $ul.hide()
      }

      self.emit('change')
    })
  }
}

function createMap(map: any, data: any) {
  const id = data.id

  if (!id && id !== 0) return

  const isArr = data.type && startWith(data.type, 'Array')
  if (isArr && data.enumerable) {
    const arr = objToArr(data, id, data.type)
    if (arr.length > 100) data = splitBigArr(arr)
  }
  map[id] = data

  const values = []
  each(['enumerable', 'unenumerable', 'symbol'], type => {
    if (!data[type]) return
    for (const key in data[type]) {
      values.push(data[type][key])
    }
  })
  if (data.proto) {
    values.push(data.proto)
  }
  for (let i = 0, len = values.length; i < len; i++) {
    const val = values[i]
    if (isObj(val)) createMap(map, val)
  }
}

function splitBigArr(data: any) {
  let idx = 0
  const enumerable: any = {}
  each(chunk(data, 100), val => {
    const obj: any = {}
    const startIdx = idx
    obj.type = '[' + startIdx
    obj.enumerable = {}
    each(val, val => {
      obj.enumerable[idx] = val
      idx += 1
    })
    const endIdx = idx - 1
    obj.type += (endIdx - startIdx > 0 ? ' … ' + endIdx : '') + ']'
    obj.id = uniqId('json')
    obj.jsonSplitArr = true
    enumerable[idx] = obj
  })

  const ret: any = {}
  ret.enumerable = enumerable
  ret.id = data.id
  ret.type = data.type
  if (data.unenumerable) ret.unenumerable = data.unenumerable
  if (data.symbol) ret.symbol = data.symbol
  if (data.proto) ret.proto = data.proto

  return ret
}

function objToArr(data: any, id: any, type: string) {
  const ret: any = []

  const enumerable: any = {}
  each(data.enumerable, (val, key) => {
    const idx = toNum(key)
    if (!isNaN(idx)) {
      ret[idx] = val
    } else {
      enumerable[key] = val
    }
  })

  ret.enumerable = enumerable
  ret.type = type
  ret.id = id
  if (data.unenumerable) ret.unenumerable = data.unenumerable
  if (data.symbol) ret.symbol = data.symbol
  if (data.proto) ret.proto = data.proto

  return ret
}

export function getObjAbstract(data: any) {
  const { type, value } = data
  if (!type) return

  if (type === 'Function') {
    return getFnAbstract(value)
  }
  if (type === 'Array' && data.unenumerable) {
    return `Array(${data.unenumerable.length})`
  }

  return data.type
}
