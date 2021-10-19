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
import toStr from 'licia/toStr'
import noop from 'licia/noop'
import naturalSort from 'licia/naturalSort'
import Visitor from './Visitor'
import { encode, getFnAbstract } from './util'
import Static from './Static'
import Component from '../share/Component'

export default class ObjectViewer extends Component {
  private data: any[]
  private visitor: Visitor
  private map: any
  private unenumerable: boolean
  private accessGetter: any
  constructor(
    container: Element,
    { unenumerable = false, accessGetter = false } = {}
  ) {
    super(container, { compName: 'object-viewer' })

    this.unenumerable = unenumerable
    this.accessGetter = accessGetter

    this.bindEvent()
  }
  set(data: any) {
    this.data = [data]
    this.visitor = new Visitor()
    this.map = {}

    this.render()
  }
  destroy() {
    super.destroy()
    this.$container.off('click', 'li', this.onItemClick)
  }
  private objToHtml(data: any, firstLevel?: boolean) {
    const { visitor } = this
    let self = data
    let isBigArr = false
    const visitedObj = visitor.get(data)
    if (visitedObj && visitedObj.self) {
      self = visitedObj.self
    }

    let ret = ''

    const types = ['enumerable']
    let enumerableKeys = keys(data)
    let unenumerableKeys: string[] = []
    let symbolKeys: (string | Symbol)[] = []
    let virtualKeys: string[] = []
    const virtualData: any = {}

    if (this.unenumerable && !firstLevel) {
      types.push('unenumerable')
      types.push('symbol')
      unenumerableKeys = difference(
        allKeys(data, {
          prototype: false,
          unenumerable: true,
        }),
        enumerableKeys
      )
      symbolKeys = filter(
        allKeys(data, {
          prototype: false,
          symbol: true,
        }),
        (key) => {
          return typeof key === 'symbol'
        }
      )
    }

    if (isArr(data) && data.length > 100) {
      types.unshift('virtual')
      isBigArr = true
      let idx = 0
      const map: any = {}
      each(chunk(data, 100), (val) => {
        const obj = Object.create(null)
        const startIdx = idx
        let key = '[' + startIdx
        each(val, (val) => {
          obj[idx] = val
          map[idx] = true
          idx++
        })
        const endIdx = idx - 1
        key += (endIdx - startIdx > 0 ? ' … ' + endIdx : '') + ']'
        virtualData[key] = obj
      })
      virtualKeys = keys(virtualData)
      enumerableKeys = filter(enumerableKeys, (val) => !map[val])
    }

    each(types, (type) => {
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
        naturalSort(typeKeys)
      }
      for (let i = 0, len = typeKeys.length; i < len; i++) {
        const key = toStr(typeKeys[i])
        let val = ''
        const descriptor = Object.getOwnPropertyDescriptor(data, key)
        const hasGetter = descriptor && descriptor.get
        const hasSetter = descriptor && descriptor.set
        if (hasGetter && !this.accessGetter) {
          val = '(...)'
        } else {
          try {
            if (type === 'virtual') {
              val = virtualData[key]
            } else {
              val = self[key]
            }
            if (isPromise(val)) {
              ;(val as any).catch(noop)
            }
          } catch (e) {
            val = e.message
          }
        }
        ret += this.createEl(key, data, val, type, firstLevel)
        if (hasGetter) {
          ret += this.createEl(
            `get ${key}`,
            data,
            (descriptor as PropertyDescriptor).get,
            type,
            firstLevel
          )
        }
        if (hasSetter) {
          ret += this.createEl(
            `set ${key}`,
            data,
            (descriptor as PropertyDescriptor).set,
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
          self: data,
        })
        this.map[id] = proto
        ret = this.objToHtml(proto)
      } else {
        ret += this.createEl('__proto__', self || data, proto, 'proto')
      }
    }

    return ret
  }
  private createEl(
    key: string,
    self: any,
    val: any,
    keyType: string,
    firstLevel = false
  ) {
    const { visitor, c } = this
    let t: any = typeof val
    let valType = type(val, false)
    if (keyType === 'virtual') valType = key

    if (val === null) {
      return `<li>${wrapKey(key)}<span class="${c('null')}">null</span></li>`
    } else if (isNum(val) || isBool(val)) {
      return `<li>${wrapKey(key)}<span class="${c(t)}">${encode(
        val
      )}</span></li>`
    }

    if (valType === 'RegExp') t = 'regexp'
    if (valType === 'Number') t = 'number'

    if (valType === 'Number' || valType === 'RegExp') {
      return `<li>${wrapKey(key)}<span class="${c(t)}">${encode(
        val.value
      )}</span></li>`
    } else if (valType === 'Undefined' || valType === 'Symbol') {
      return `<li>${wrapKey(key)}<span class="${c('special')}">${lowerCase(
        valType
      )}</span></li>`
    } else if (val === '(...)') {
      return `<li>${wrapKey(key)}<span class="${c(
        'special'
      )}">${val}</span></li>`
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
        this.map[id] = val
      }
      const objAbstract = getObjAbstract(val, valType) || upperFirst(t)

      const icon = firstLevel
        ? ''
        : `<span class="${c('expanded collapsed')}"><span class="${c(
            'icon icon-caret-right'
          )}"></span><span class="${c('icon icon-caret-down')}"></span></span>`

      let obj = `<li ${firstLevel ? 'data-first-level="true"' : ''} ${
        'data-object-id="' + id + '"'
      }>${icon}${wrapKey(key)}<span class="${c('open')}">${
        firstLevel ? '' : objAbstract
      }</span><ul class="${c(t)}" ${firstLevel ? '' : 'style="display:none"'}>`

      if (firstLevel) obj += this.objToHtml(val)

      return obj + `</ul><span class="${c('close')}"></span></li>`
    }

    function wrapKey(key: string) {
      if (firstLevel) return ''
      if (isObj(val) && keyType === 'virtual') return ''

      let keyClass = c('key')
      if (
        keyType === 'unenumerable' ||
        keyType === 'proto' ||
        keyType === 'symbol'
      ) {
        keyClass = c('key-lighter')
      }

      return `<span class="${keyClass}">${encode(key)}</span>: `
    }

    return `<li>${wrapKey(key)}<span class="${c(typeof val)}">"${encode(
      val
    )}"</span></li>`
  }
  private render() {
    this.$container.html(this.objToHtml(this.data, true))
  }
  private bindEvent() {
    this.$container.on('click', 'li', this.onItemClick)
  }
  private onItemClick = (e: any) => {
    const { map, c } = this
    const $this = $(e.curTarget)
    const circularId = $this.data('object-id')
    const $firstSpan: any = $this.find('span').eq(0)

    if ($this.data('first-level')) return
    if (circularId) {
      $this.find('ul').html(this.objToHtml(map[circularId], false))
      $this.rmAttr('data-object-id')
    }

    e.stopImmediatePropagation()

    if (!$firstSpan.hasClass(c('expanded'))) return

    const $ul: any = $this.find('ul').eq(0)
    if ($firstSpan.hasClass(c('collapsed'))) {
      $firstSpan.rmClass(c('collapsed'))
      $ul.show()
    } else {
      $firstSpan.addClass(c('collapsed'))
      $ul.hide()
    }

    this.emit('change')
  }
  static Static = Static
}

module.exports = ObjectViewer
module.exports.default = ObjectViewer

function getObjAbstract(data: any, type: string) {
  if (!type) return

  if (type === 'Function') {
    return getFnAbstract(toSrc(data))
  }
  if (type === 'Array') {
    return `Array(${data.length})`
  }

  return type
}
