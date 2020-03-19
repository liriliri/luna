import extend from 'licia/extend'
import Emitter from 'licia/Emitter'
import getProto from 'licia/getProto'
import isNum from 'licia/isNum'
import isBool from 'licia/isBool'
import lowerCase from 'licia/lowerCase'
import isObj from 'licia/isObj'
import isArr from 'licia/isArr'
import upperFirst from 'licia/upperFirst'
import keys from 'licia/keys'
import each from 'licia/each'
import toSrc from 'licia/toSrc'
import isPromise from 'licia/isPromise'
import type from 'licia/type'
import $ from 'licia/$'
import difference from 'licia/difference'
import allKeys from 'licia/allKeys'
import filter from 'licia/filter'
import chunk from 'licia/chunk'
import { encode, getFnAbstract, sortObjName } from './util'
import './style.scss'

module.exports = class LunaObjViewer extends Emitter {
  _data: any
  _$el: any
  _visitor: any
  _map: any
  _showUnenumerable: any
  _showGetterVal: any
  constructor(
    data,
    el,
    { showUnenumerable = false, showGetterVal = false } = {}
  ) {
    super()

    this._data = [data]
    this._$el = $(el)
    this._visitor = new Visitor()
    this._map = {}
    this._showUnenumerable = showUnenumerable
    this._showGetterVal = showGetterVal

    this._appendTpl()
    this._bindEvent()
  }
  _objToHtml(data, firstLevel?: boolean) {
    const visitor = this._visitor
    let self = data
    let isBigArr = false
    const visitedObj = visitor.get(data)
    if (visitedObj && visitedObj.self) {
      self = visitedObj.self
    }

    let ret = ''

    const types = ['enumerable']
    let enumerableKeys = keys(data)
    let unenumerableKeys = []
    let symbolKeys = []
    let virtualKeys = []
    const virtualData = {}

    if (this._showUnenumerable && !firstLevel) {
      types.push('unenumerable')
      types.push('symbol')
      unenumerableKeys = difference(
        allKeys(data, {
          prototype: false,
          unenumerable: true
        }),
        enumerableKeys
      )
      symbolKeys = filter(
        allKeys(data, {
          prototype: false,
          symbol: true
        }),
        key => {
          return typeof key === 'symbol'
        }
      )
    }

    if (isArr(data) && data.length > 100) {
      types.unshift('virtual')
      isBigArr = true
      let idx = 0
      const map = {}
      each(chunk(data, 100), val => {
        const obj = Object.create(null)
        const startIdx = idx
        let key = '[' + startIdx
        each(val, val => {
          obj[idx] = val
          map[idx] = true
          idx++
        })
        const endIdx = idx - 1
        key += (endIdx - startIdx > 0 ? ' … ' + endIdx : '') + ']'
        virtualData[key] = obj
      })
      virtualKeys = keys(virtualData)
      enumerableKeys = filter(enumerableKeys, val => !map[val])
    }

    each(types, type => {
      let typeKeys = []
      if (type === 'symbol') {
        typeKeys = symbolKeys
      } else if (type === 'unenumerable') {
        typeKeys = unenumerableKeys
      } else if (type === 'virtual') {
        typeKeys = virtualKeys
      } else {
        typeKeys = enumerableKeys
      }
      if (!isBigArr) {
        typeKeys.sort(sortObjName)
      }
      for (let i = 0, len = typeKeys.length; i < len; i++) {
        const key = typeKeys[i]
        let val = ''
        const descriptor = Object.getOwnPropertyDescriptor(data, key)
        const hasGetter = descriptor && descriptor.get
        const hasSetter = descriptor && descriptor.set
        if (hasGetter && !this._showGetterVal) {
          val = '(...)'
        } else {
          try {
            if (type === 'virtual') {
              val = virtualData[key]
            } else {
              val = self[key]
            }
            if (isPromise(val)) {
              ;(val as any).catch(() => {})
            }
          } catch (e) {
            val = e.message
          }
        }
        ret += this._createEl(key, data, val, type, firstLevel)
        if (hasGetter) {
          ret += this._createEl(
            `get ${key}`,
            data,
            descriptor.get,
            type,
            firstLevel
          )
        }
        if (hasSetter) {
          ret += this._createEl(
            `set ${key}`,
            data,
            descriptor.set,
            type,
            firstLevel
          )
        }
      }
    })

    const proto = getProto(data)
    if (!firstLevel && proto) {
      if (ret === '') {
        const id = visitor.set(proto, {
          self: data
        })
        this._map[id] = proto
        ret = this._objToHtml(proto)
      } else {
        ret += this._createEl('__proto__', self || data, proto, 'proto')
      }
    }

    return ret
  }
  _createEl(key, self, val, keyType, firstLevel = false) {
    const visitor = this._visitor
    let t: any = typeof val
    let valType = type(val, false)
    if (keyType === 'virtual') valType = key

    if (val === null) {
      return `<li>${wrapKey(key)}<span class="eruda-null">null</span></li>`
    } else if (isNum(val) || isBool(val)) {
      return `<li>${wrapKey(key)}<span class="eruda-${t}">${encode(
        val
      )}</span></li>`
    }

    if (valType === 'RegExp') t = 'regexp'
    if (valType === 'Number') t = 'number'

    if (valType === 'Number' || valType === 'RegExp') {
      return `<li>${wrapKey(key)}<span class="eruda-${t}">${encode(
        val.value
      )}</span></li>`
    } else if (valType === 'Undefined' || valType === 'Symbol') {
      return `<li>${wrapKey(key)}<span class="eruda-special">${lowerCase(
        valType
      )}</span></li>`
    } else if (val === '(...)') {
      return `<li>${wrapKey(key)}<span class="eruda-special">${val}</span></li>`
    } else if (isObj(val)) {
      const visitedObj = visitor.get(val)
      let id
      if (visitedObj) {
        id = visitedObj.id
      } else {
        const extra: any = {}
        if (keyType === 'proto') {
          extra.self = self
        }
        id = visitor.set(val, extra)
        this._map[id] = val
      }
      const objAbstract = getObjAbstract(val, valType) || upperFirst(t)

      let obj = `<li ${
        firstLevel ? 'data-first-level="true"' : ''
      } ${'data-object-id="' + id + '"'}><span class="${
        firstLevel ? '' : 'eruda-expanded eruda-collapsed'
      }"></span>${wrapKey(key)}<span class="eruda-open">${
        firstLevel ? '' : objAbstract
      }</span><ul class="eruda-${t}" ${
        firstLevel ? '' : 'style="display:none"'
      }>`

      if (firstLevel) obj += this._objToHtml(val)

      return obj + '</ul><span class="eruda-close"></span></li>'
    }

    function wrapKey(key) {
      if (firstLevel) return ''
      if (isObj(val) && keyType === 'virtual') return ''

      let keyClass = 'eruda-key'
      if (
        keyType === 'unenumerable' ||
        keyType === 'proto' ||
        keyType === 'symbol'
      ) {
        keyClass = 'eruda-key-lighter'
      }

      return `<span class="${keyClass}">${encode(key)}</span>: `
    }

    return `<li>${wrapKey(key)}<span class="eruda-${typeof val}">"${encode(
      val
    )}"</span></li>`
  }
  _appendTpl() {
    this._$el.html(this._objToHtml(this._data, true))
  }
  _bindEvent() {
    const map = this._map

    const self = this

    this._$el.on('click', 'li', function(e) {
      const $this = $(this)
      const circularId = $this.data('object-id')
      const $firstSpan: any = $(this)
        .find('span')
        .eq(0)

      if ($this.data('first-level')) return
      if (circularId) {
        $this.find('ul').html(self._objToHtml(map[circularId], false))
        $this.rmAttr('data-object-id')
      }

      e.stopImmediatePropagation()

      if (!$firstSpan.hasClass('eruda-expanded')) return

      const $ul: any = $this.find('ul').eq(0)
      if ($firstSpan.hasClass('eruda-collapsed')) {
        $firstSpan.rmClass('eruda-collapsed')
        $ul.show()
      } else {
        $firstSpan.addClass('eruda-collapsed')
        $ul.hide()
      }

      self.emit('change')
    })
  }
}

function getObjAbstract(data, type) {
  if (!type) return

  if (type === 'Function') {
    return getFnAbstract(toSrc(data))
  }
  if (type === 'Array') {
    return `Array(${data.length})`
  }

  return type
}

class Visitor {
  id: number
  visited: any[]
  constructor() {
    this.id = 0
    this.visited = []
  }
  set(val, extra) {
    const { visited, id } = this
    const obj = {
      id,
      val
    }
    extend(obj, extra)
    visited.push(obj)

    this.id++

    return id
  }
  get(val) {
    const { visited } = this

    for (let i = 0, len = visited.length; i < len; i++) {
      const obj = visited[i]
      if (val === obj.val) return obj
    }

    return false
  }
}
