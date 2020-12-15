import origGetAbstract from './getAbstract'
// @ts-ignore
import LunaObjectViewer from 'luna-object-viewer'
import isObj from 'licia/isObj'
import isStr from 'licia/isStr'
import isErr from 'licia/isErr'
import isPrimitive from 'licia/isPrimitive'
import wrap from 'licia/wrap'
import defaults from 'licia/defaults'
import isEl from 'licia/isEl'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import toInt from 'licia/toInt'
import escape from 'licia/escape'
import isNull from 'licia/isNull'
import isUndef from 'licia/isUndef'
import isFn from 'licia/isFn'
import toArr from 'licia/toArr'
import isArr from 'licia/isArr'
import unique from 'licia/unique'
import contain from 'licia/contain'
import isEmpty from 'licia/isEmpty'
import clone from 'licia/clone'
import noop from 'licia/noop'
import each from 'licia/each'
import trim from 'licia/trim'
import lowerCase from 'licia/lowerCase'
import keys from 'licia/keys'
import $ from 'licia/$'
import Emitter from 'licia/Emitter'
import stringifyAll from 'licia/stringifyAll'
import nextTick from 'licia/nextTick'
import linkify from 'licia/linkify'
import { getObjType } from './util'
import stripIndent from 'licia/stripIndent'
import { classPrefix } from '../share/util'

const c = classPrefix('console')

export interface IGroup {
  id: string
  collapsed: boolean
  parent: IGroup
  indentLevel: number
}

export interface IHeader {
  time: string
  from: string
}

export interface ILogOptions {
  type: string
  args: any[]
  id: number
  group?: IGroup
  targetGroup?: IGroup
  header?: IHeader
  ignoreFilter?: boolean
}

export default class Log extends Emitter {
  static showGetterVal = false
  static showUnenumerable = true
  static lazyEvaluation = true
  static showSrcInSources = false
  public id: number
  public type: string
  public group?: IGroup
  public targetGroup?: IGroup
  public args: any[]
  public header: IHeader | void
  public count = 1
  public ignoreFilter: boolean
  public collapsed: boolean
  public el: Element
  public $el: $.$
  public src: any
  public width = 0
  public height = 0
  private content: Element
  private $content: $.$
  constructor({
    type = 'log',
    args = [],
    id,
    group,
    targetGroup,
    header,
    ignoreFilter = false,
  }: ILogOptions) {
    super()

    this.type = type
    this.group = group
    this.targetGroup = targetGroup
    this.args = args
    this.id = id
    this.header = header
    this.ignoreFilter = ignoreFilter
    this.collapsed = false
    this.el = document.createElement('div')
    ;(this.el as any).log = this
    this.height = 0
    this.width = 0
    this.$el = $(this.el)

    this._formatMsg()

    if (this.group) {
      this.checkGroup()
    }
  }
  // If state changed, return true.
  checkGroup() {
    let { group } = this

    let collapsed = false
    while (group) {
      if (group.collapsed) {
        collapsed = true
        break
      }
      group = group.parent
    }
    if (collapsed !== this.collapsed) {
      this.collapsed = collapsed
      return true
    }

    return false
  }
  updateIcon(icon: string) {
    const $icon = this.$el.find(`.${c('icon')}`)

    $icon.rmAttr('class').addClass([c('icon'), c(`icon-${icon}`)])

    return this
  }
  addCount() {
    this.count++
    const { $el, count } = this
    const $container = $el.find('.eruda-count-container')
    const $icon = $el.find('.eruda-icon-container')
    const $count = $container.find('.eruda-count')
    if (count === 2) {
      $container.rmClass(c('hidden'))
    }
    $count.text(toStr(count))
    $icon.addClass(c('hidden'))

    return this
  }
  groupEnd() {
    const { $el } = this
    const $lastNesting = $el
      .find(`.${c('nesting-level')}:not(.${c('group-closed')})`)
      .last()

    $lastNesting.addClass(c('group-closed'))

    return this
  }
  updateTime(time: string) {
    const $el = this.$el
    const $container = $el.find('.eruda-time-container')

    if (this.header) {
      $container.find('span').eq(0).text(time)
      this.header.time = time
    }

    return this
  }
  isAttached() {
    return !!this.el.parentNode
  }
  updateSize(silent = true) {
    const height = (this.el as HTMLElement).offsetHeight
    const width = (this.el as HTMLElement).offsetWidth
    if (this.height !== height || this.width !== width) {
      this.height = height
      this.width = width
      if (!silent) this.emit('updateSize')
    }
  }
  html() {
    return this.el.outerHTML
  }
  text() {
    return this.content.textContent || ''
  }
  _needSrc() {
    const { type, args } = this

    if (type === 'html') return false

    for (let i = 0, len = args.length; i < len; i++) {
      if (isObj(args[i])) return true
    }

    return false
  }
  extractObj(cb = noop) {
    const { args, type } = this

    const setSrc = (result: any) => {
      this.src = result
      cb()
    }
    if (type === 'table') {
      extractObj(args[0], {}, setSrc)
    } else {
      extractObj(
        args.length === 1 && isObj(args[0]) ? args[0] : args,
        {},
        setSrc
      )
    }
  }
  click(logger: any) {
    const { type, src, $el } = this
    let { args } = this

    switch (type) {
      case 'log':
      case 'warn':
      case 'info':
      case 'debug':
      case 'output':
      case 'table':
      case 'dir':
      case 'group':
      case 'groupCollapsed':
        if (src || args) {
          const $json = $el.find(`.${c('json')}`)
          if ($json.hasClass(c('hidden'))) {
            if ($json.data('init') !== 'true') {
              if (src) {
                const staticViewer = new LunaObjectViewer.Static($json.get(0))
                staticViewer.set(src)
                staticViewer.on('change', () => this.updateSize(false))
              } else {
                if (type === 'table' || args.length === 1) {
                  if (isObj(args[0])) args = args[0]
                }
                const objViewer = new LunaObjectViewer($json.get(0), {
                  unenumerable: Log.showUnenumerable,
                  accessGetter: Log.showGetterVal,
                })
                objViewer.set(args)
                objViewer.on('change', () => this.updateSize(false))
              }
              $json.data('init', 'true')
            }
            $json.rmClass(c('hidden'))
          } else {
            $json.addClass(c('hidden'))
          }
        } else if (type === 'group' || type === 'groupCollapsed') {
          logger.toggleGroup(this)
        }
        break
      case 'error':
        $el.find(`.${c('stack')}`).toggleClass(c('hidden'))
        break
    }

    this.updateSize(false)
  }
  _formatMsg() {
    let { args } = this
    const { type, id, header, group } = this

    // Don't change original args for lazy evaluation.
    args = clone(args)

    if (this._needSrc() && !Log.lazyEvaluation) {
      this.extractObj()
    }

    let msg = ''
    let icon
    let err

    if (type === 'group' || type === 'groupCollapsed') {
      if (args.length === 0) {
        args = ['console.group']
      }
    }

    switch (type) {
      case 'log':
        msg = formatMsg(args)
        break
      case 'debug':
        msg = formatMsg(args)
        break
      case 'dir':
        msg = formatDir(args)
        break
      case 'info':
        msg = formatMsg(args)
        break
      case 'warn':
        icon = 'warn'
        msg = formatMsg(args)
        break
      case 'error':
        if (isStr(args[0]) && args.length !== 1) args = substituteStr(args)
        err = args[0]
        icon = 'error'
        err = isErr(err) ? err : new Error(formatMsg(args))
        this.src = err
        msg = formatErr(err)
        break
      case 'table':
        msg = formatTable(args)
        break
      case 'html':
        msg = args[0]
        break
      case 'input':
        msg = formatJs(args[0])
        icon = 'arrow-right'
        break
      case 'output':
        msg = formatMsg(args)
        icon = 'arrow-left'
        break
      case 'groupCollapsed':
        msg = formatMsg(args)
        icon = 'arrow-right'
        break
      case 'group':
        msg = formatMsg(args)
        icon = 'arrow-down'
        break
    }

    if (!this._needSrc() || !Log.lazyEvaluation) {
      delete (this as any).args
    }

    // Only linkify for simple types
    if (type !== 'error' && !this.args) {
      msg = linkify(msg, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`
      })
    }
    msg = render({ msg, type, icon, id, header, group })

    this.$el.addClass(`${c('log-container')}`).html(msg)
    this.$content = this.$el.find(`.${c('log-content')}`)
    this.content = this.$content.get(0)
  }
}

const getAbstract = wrap(origGetAbstract, function (fn, obj) {
  return (
    `<span class="${c('abstract')}">` +
    fn(obj, {
      getterVal: Log.showGetterVal,
      unenumerable: false,
    }) +
    '</span>'
  )
})

const Value = '__ErudaValue'

function formatTable(args: any[]) {
  const table = args[0]
  let ret = ''
  let filter = args[1]
  let columns: string[] = []

  if (isStr(filter)) filter = toArr(filter)
  if (!isArr(filter)) filter = null

  if (!isObj(table)) return formatMsg(args)

  each(table, (val) => {
    if (isPrimitive(val)) {
      columns.push(Value)
    } else if (isObj(val)) {
      columns = columns.concat(keys(val))
    }
  })
  columns = unique(columns)
  columns.sort()
  if (filter) columns = columns.filter((val) => contain(filter, val))
  if (columns.length > 20) columns = columns.slice(0, 20)
  if (isEmpty(columns)) return formatMsg(args)

  ret += '<table><thead><tr><th>(index)</th>'
  columns.forEach(
    (val) => (ret += `<th>${val === Value ? 'Value' : toStr(val)}</th>`)
  )
  ret += '</tr></thead><tbody>'

  each(table, (obj: any, idx) => {
    ret += `<tr><td>${idx}</td>`
    columns.forEach((column) => {
      if (isObj(obj)) {
        ret +=
          column === Value
            ? '<td></td>'
            : `<td>${formatTableVal(obj[column])}</td>`
      } else if (isPrimitive(obj)) {
        ret +=
          column === Value ? `<td>${formatTableVal(obj)}</td>` : '<td></td>'
      }
    })
    ret += '</tr>'
  })

  ret += '</tbody></table>'
  ret += `<div class="${c('json hidden')}"></div>`

  return ret
}

function formatTableVal(val: any) {
  if (isObj(val)) return (val = '{…}')
  if (isPrimitive(val)) return getAbstract(val)

  return toStr(val)
}

const regJsUrl = /https?:\/\/([0-9.\-A-Za-z]+)(?::(\d+))?\/[A-Z.a-z0-9/]*\.js/g
const regErudaJs = /eruda(\.min)?\.js/

function formatErr(err: Error) {
  let lines = err.stack ? err.stack.split('\n') : []
  const msg = `${err.message || lines[0]}<br/>`

  lines = lines
    .filter((val: string) => !regErudaJs.test(val))
    .map((val: string) => escape(val))

  const stack = `<div class="${c('stack hidden')}">${lines
    .slice(1)
    .join('<br/>')}</div>`

  return (
    msg +
    stack.replace(
      regJsUrl,
      (match) => `<a href="${match}" target="_blank">${match}</a>`
    )
  )
}

function formatJs(val: string) {
  return val
}

function formatMsg(args: any[], { htmlForEl = true } = {}) {
  const needStrSubstitution = isStr(args[0]) && args.length !== 1
  if (needStrSubstitution) args = substituteStr(args)

  for (let i = 0, len = args.length; i < len; i++) {
    let val = args[i]

    if (isEl(val) && htmlForEl) {
      args[i] = formatEl(val)
    } else if (isFn(val)) {
      args[i] = formatFn(val)
    } else if (isObj(val)) {
      args[i] = formatObj(val)
    } else if (isUndef(val)) {
      args[i] = 'undefined'
    } else if (isNull(val)) {
      args[i] = 'null'
    } else {
      val = toStr(val)
      if (i !== 0 || !needStrSubstitution) val = escape(val)
      args[i] = val
    }
  }

  return args.join(' ') + `<div class="${c('json hidden')}"></div>`
}

const formatDir = (args: any[]) => formatMsg(args, { htmlForEl: false })

function substituteStr(args: any[]) {
  const str = escape(args[0])
  let isInCss = false
  let newStr = ''

  args.shift()

  for (let i = 0, len = str.length; i < len; i++) {
    const c = str[i]

    if (c === '%' && args.length !== 0) {
      i++
      const arg = args.shift()
      switch (str[i]) {
        case 'i':
        case 'd':
          newStr += toInt(arg)
          break
        case 'f':
          newStr += toNum(arg)
          break
        case 's':
          newStr += toStr(arg)
          break
        case 'O':
          if (isObj(arg)) {
            newStr += getAbstract(arg)
          }
          break
        case 'o':
          if (isEl(arg)) {
            newStr += formatEl(arg)
          } else if (isObj(arg)) {
            newStr += getAbstract(arg)
          }
          break
        case 'c':
          if (str.length <= i + 1) {
            break
          }
          if (isInCss) newStr += '</span>'
          isInCss = true
          newStr += `<span style="${correctStyle(arg)}">`
          break
        default:
          i--
          args.unshift(arg)
          newStr += c
      }
    } else {
      newStr += c
    }
  }
  if (isInCss) newStr += '</span>'

  args.unshift(newStr)

  return args
}

function correctStyle(val: string) {
  val = lowerCase(val)
  const rules = val.split(';')
  const style: any = {}
  each(rules, (rule: string) => {
    if (!contain(rule, ':')) return
    const [name, val] = rule.split(':')
    style[trim(name)] = trim(val)
  })
  style['display'] = 'inline-block'
  style['max-width'] = '100%'
  delete style.width
  delete style.height

  let ret = ''
  each(style, (val, key) => {
    ret += `${key}:${val};`
  })
  return ret
}

function formatObj(val: any) {
  let type = getObjType(val)
  if (type === 'Array' && val.length > 1) type = `(${val.length})`

  return `${type} ${getAbstract(val)}`
}

function formatFn(val: any) {
  return `<pre style="display:inline">${formatJs(val.toString())}</pre>`
}

function formatEl(val: string) {
  return val
}

const render = function (data: any) {
  let html = ''

  if (data.header) {
  }

  let indent = ''
  if (data.group) {
    const { indentLevel } = data.group
    for (let i = 0; i < indentLevel; i++) {
      indent += `<div class="${c('nesting-level')}"></div>`
    }
  }

  let icon = ''
  if (data.icon) {
    icon = `<div class="${c('icon-container')}"><span class="${c(
      'icon icon-' + data.icon
    )}"></span></div>`
  }

  html += stripIndent`
    <div class="${c(data.type + ' log-item')}">
      ${indent}
      ${icon}
      <div class="${c('count-container hidden')}">
        <div class="${c('count')}"></div>
      </div>    
      <div class="${c('log-content-wrapper')}">
        <div class="${c('log-content')}">${data.msg}</div>
      </div>
    </div>
  `

  return html
}

function extractObj(obj: any, options = {}, cb: Function) {
  defaults(options, {
    accessGetter: Log.showGetterVal,
    unenumerable: Log.showUnenumerable,
    symbol: Log.showUnenumerable,
    timeout: 1000,
  })

  stringify(obj, options, (result: string) => cb(JSON.parse(result)))
}

function stringify(obj: any, options: any, cb: Function) {
  const result = stringifyAll(obj, options)
  nextTick(() => cb(result))
}
