import getPreview from './getPreview'
import LunaObjectViewer, {
  Static as LunaStaticObjectViewer,
} from 'luna-object-viewer'
import LunaDataGrid from 'luna-data-grid'
import LunaDomViewer from 'luna-dom-viewer'
import ResizeSensor from 'licia/ResizeSensor'
import types from 'licia/types'
import isObj from 'licia/isObj'
import isStr from 'licia/isStr'
import isErr from 'licia/isErr'
import isPrimitive from 'licia/isPrimitive'
import defaults from 'licia/defaults'
import isEl from 'licia/isEl'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import toInt from 'licia/toInt'
import concat from 'licia/concat'
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
import each from 'licia/each'
import map from 'licia/map'
import trim from 'licia/trim'
import lowerCase from 'licia/lowerCase'
import isHidden from 'licia/isHidden'
import keys from 'licia/keys'
import $ from 'licia/$'
import h from 'licia/h'
import Emitter from 'licia/Emitter'
import debounce from 'licia/debounce'
import safeStringify from 'licia/stringify'
import copy from 'licia/copy'
import stringifyAll from 'licia/stringifyAll'
import nextTick from 'licia/nextTick'
import linkify from 'licia/linkify'
import highlight from 'licia/highlight'
import truncate from 'licia/truncate'
import some from 'licia/some'
import isNum from 'licia/isNum'
import { getObjType } from './util'
import stripIndent from 'licia/stripIndent'
import toEl from 'licia/toEl'
import uniqId from 'licia/uniqId'
import isBool from 'licia/isBool'
import isSymbol from 'licia/isSymbol'
import isRegExp from 'licia/isRegExp'
import Console from './index'

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
  accessGetter: boolean
  unenumerable: boolean
  lazyEvaluation: boolean
}

const regJsUrl = /https?:\/\/([0-9.\-A-Za-z]+)(?::(\d+))?\/[A-Z.a-z0-9/]*\.js/g
const emptyHighlightStyle = {
  comment: '',
  string: '',
  number: '',
  keyword: '',
  operator: '',
}

export default class Log extends Emitter {
  container: HTMLElement = h('div')
  id: number
  type: string
  level: string
  group?: IGroup
  targetGroup?: IGroup
  args: any[]
  header: IHeader | void
  count = 1
  ignoreFilter: boolean
  collapsed: boolean
  src: any
  width = 0
  height = 0
  private accessGetter: boolean
  private unenumerable: boolean
  private lazyEvaluation: boolean
  private $container: $.$
  private content: Element
  private $content: $.$
  private console: Console
  private resizeSensor: ResizeSensor
  private onResize: () => void
  private isHidden = false
  private columns: string[] = []
  private elements: types.PlainObj<HTMLElement> = {}
  private objects: types.PlainObj<any> = {}
  constructor(
    console: Console,
    {
      type = 'log',
      args = [],
      id,
      group,
      targetGroup,
      header,
      ignoreFilter = false,
      accessGetter,
      unenumerable,
      lazyEvaluation,
    }: ILogOptions
  ) {
    super()

    this.console = console
    this.type = type
    this.group = group
    this.targetGroup = targetGroup
    this.args = args
    this.id = id
    this.header = header
    this.ignoreFilter = ignoreFilter
    this.collapsed = false
    ;(this.container as any).log = this
    this.height = 0
    this.width = 0
    this.$container = $(this.container)
    this.accessGetter = accessGetter
    this.unenumerable = unenumerable
    this.lazyEvaluation = lazyEvaluation

    let level = 'info'
    switch (type) {
      case 'debug':
        level = 'verbose'
        break
      case 'error':
        level = 'error'
        break
      case 'warn':
        level = 'warning'
        break
    }
    this.level = level

    this.resizeSensor = new ResizeSensor(this.container)
    this.onResize = debounce(() => {
      if (isHidden(this.container)) {
        this.isHidden = true
      } else {
        if (!this.isHidden) {
          this.updateSize(false)
        }
        this.isHidden = false
      }
    }, 16)

    this.formatMsg()

    if (this.group) {
      this.checkGroup()
    }

    this.bindEvent()
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
    const { c } = this.console
    const $icon = this.$container.find(c('.icon-container')).find(c('.icon'))

    $icon.rmAttr('class').addClass([c('icon'), c(`icon-${icon}`)])

    return this
  }
  addCount() {
    this.count++
    const { $container, count } = this
    const { c } = this.console
    const $countContainer = $container.find(c('.count-container'))
    const $icon = $container.find(c('.icon-container'))
    const $count = $countContainer.find(c('.count'))
    if (count === 2) {
      $countContainer.rmClass(c('hidden'))
    }
    $count.text(toStr(count))
    $icon.addClass(c('hidden'))

    return this
  }
  groupEnd() {
    const { $container } = this
    const { c } = this.console
    const $lastNesting = $container
      .find(`.${c('nesting-level')}:not(.${c('group-closed')})`)
      .last()

    $lastNesting.addClass(c('group-closed'))

    return this
  }
  updateTime(time: string) {
    const $timeContainer = this.$container.find(
      this.console.c('.time-container')
    )

    if (this.header) {
      $timeContainer.find('span').eq(0).text(time)
      this.header.time = time
    }

    return this
  }
  isAttached() {
    return !!this.container.parentNode
  }
  // No object types.
  isSimple() {
    return !some(this.args, (arg) => isObj(arg))
  }
  updateSize(silent = true) {
    // offsetHeight, offsetWidth is rounded to an integer.
    const { width, height } = this.container.getBoundingClientRect()
    const newHeight = height - 1
    if (this.height !== newHeight) {
      this.height = newHeight
      if (!silent) {
        this.emit('updateHeight')
      }
    }
    if (this.width !== width) {
      this.width = width
    }
  }
  html() {
    return this.container.outerHTML
  }
  text() {
    return this.content.textContent || ''
  }
  select() {
    this.$container.addClass(this.console.c('selected'))
  }
  deselect() {
    this.$container.rmClass(this.console.c('selected'))
  }
  copy() {
    const { args } = this

    let str = ''

    each(args, (arg, idx) => {
      if (idx !== 0) {
        str += ' '
      }
      if (isObj(arg)) {
        str += safeStringify(arg)
      } else {
        str += toStr(arg)
      }
    })

    copy(str)
  }
  private bindEvent() {
    const { c } = this.console
    const self = this

    this.resizeSensor.addListener(this.onResize)
    this.$container
      .on('click', c('.dom-viewer'), (e) => e.stopPropagation())
      .on('click', c('.preview'), function (this: HTMLElement, e) {
        e.stopPropagation()
        const $this = $(this)
        const $icon = $this.find(c('.preview-icon-container')).find(c('.icon'))
        let icon = 'caret-down'
        if ($icon.hasClass(c('icon-caret-down'))) {
          icon = 'caret-right'
        }
        $icon.rmAttr('class').addClass([c('icon'), c(`icon-${icon}`)])
        self.renderObjectViewer(this)
      })
      .on('click', () => this.click())
  }
  private renderEl() {
    const { elements } = this
    const { c } = this.console

    const self = this
    this.$container.find(c('.dom-viewer')).each(function (this: HTMLElement) {
      const $this = $(this)
      const id = $this.data('id')
      new LunaDomViewer(this, {
        node: elements[id],
        theme: self.console.getOption('theme'),
      })
    })
  }
  private renderObjectViewer(preview: HTMLElement) {
    const { console, unenumerable, accessGetter, lazyEvaluation } = this
    const { c } = console

    const $container = $(preview)
    const id = $container.data('id')
    if (!id) {
      return
    }

    const obj = this.objects[id]

    const $json = $container.find(c('.json'))
    if ($json.hasClass(c('hidden'))) {
      if ($json.data('init') !== 'true') {
        if (!lazyEvaluation) {
          const staticViewer = new LunaStaticObjectViewer($json.get(0))
          staticViewer.setOption('theme', console.getOption('theme'))
          staticViewer.set(obj)
        } else {
          const objViewer = new LunaObjectViewer($json.get(0), {
            unenumerable,
            accessGetter,
          })
          objViewer.setOption('theme', console.getOption('theme'))
          objViewer.set(obj)
        }
        $json.data('init', 'true')
      }
      $json.rmClass(c('hidden'))
    } else {
      $json.addClass(c('hidden'))
    }
  }
  private renderTable(args: any[]) {
    const Value = '__LunaConsoleValue'
    const { columns, $container, console } = this
    const { c } = console
    const $dataGrid = $container.find(c('.data-grid'))
    const table = args[0]

    const dataGrid = new LunaDataGrid($dataGrid.get(0) as HTMLElement, {
      columns: concat(
        [
          {
            id: '(index)',
            title: '(index)',
            sortable: true,
          },
        ],
        map(columns, (column) => {
          return {
            id: column,
            title: column === Value ? 'Value' : column,
            sortable: true,
          }
        })
      ),
      theme: console.getOption('theme'),
    })

    each(table, (obj: any, idx) => {
      const data: any = {
        '(index)': toStr(idx),
      }
      columns.forEach((column) => {
        if (isObj(obj)) {
          data[column] =
            column === Value ? '' : this.formatTableVal(obj[column])
        } else if (isPrimitive(obj)) {
          data[column] = column === Value ? this.formatTableVal(obj) : ''
        }
      })
      dataGrid.append(data)
    })
  }
  private extractObj(obj: any, options = {}, cb: Function) {
    const { accessGetter, unenumerable } = this
    defaults(options, {
      accessGetter,
      unenumerable,
      symbol: unenumerable,
      timeout: 1000,
    })

    stringify(obj, options, (result: string) => cb(JSON.parse(result)))
  }
  private click() {
    const { type, $container, console } = this
    const { c } = console

    switch (type) {
      case 'log':
      case 'warn':
      case 'debug':
      case 'output':
      case 'table':
      case 'dir':
        break
      case 'group':
      case 'groupCollapsed':
        console.toggleGroup(this)
        break
      case 'error':
        $container.find(c('.stack')).toggleClass(c('hidden'))
        break
    }
  }
  private formatMsg() {
    let { args } = this
    const { type, id, header, group } = this
    const { c } = this.console

    // Don't change original args for lazy evaluation.
    args = clone(args)

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
        msg = this.formatCommon(args)
        break
      case 'debug':
        msg = this.formatCommon(args)
        break
      case 'dir':
        msg = this.formatDir(args)
        break
      case 'warn':
        icon = 'warn'
        msg = this.formatCommon(args)
        break
      case 'error':
        if (isStr(args[0]) && args.length !== 1) args = this.substituteStr(args)
        err = args[0]
        icon = 'error'
        err = isErr(err) ? err : new Error(this.formatCommon(args))
        msg = this.formatErr(err)
        break
      case 'table':
        msg = this.formatTable(args)
        break
      case 'html':
        msg = args[0]
        break
      case 'input':
        msg = this.formatJs(args[0])
        icon = 'input'
        break
      case 'output':
        msg = this.formatCommon(args)
        icon = 'output'
        break
      case 'groupCollapsed':
        msg = this.formatCommon(args)
        icon = 'caret-right'
        break
      case 'group':
        msg = this.formatCommon(args)
        icon = 'caret-down'
        break
    }

    // Only linkify for simple types
    if (contain(['log', 'debug', 'warn'], type) && this.isSimple()) {
      msg = linkify(msg, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`
      })
    }
    msg = this.render({ msg, type, icon, id, header, group })

    this.$container.addClass(`${c('log-container')}`).html(msg)

    switch (type) {
      case 'table':
        if (!isEmpty(this.columns)) {
          this.renderTable(args)
        }
        break
    }
    if (!isEmpty(this.elements)) {
      this.renderEl()
    }

    this.$content = this.$container.find(c('.log-content'))
    this.content = this.$content.get(0)
  }
  private render(data: any) {
    const { c } = this.console
    let html = ''

    let indent = ''
    if (data.group) {
      const { indentLevel } = data.group
      for (let i = 0; i < indentLevel; i++) {
        indent += `<div class="${c('nesting-level')}"></div>`
      }
    }

    if (data.header) {
      html += stripIndent`
      <div class="${c('header')}">
        ${indent}
        <div class="${c('time-from-container')}">
          <span>${data.header.time}</span> <span>${data.header.from}</span>
        </div>
      </div>`
    }

    let icon = ''
    if (data.icon) {
      icon = `<div class="${c('icon-container')}"><span class="${c(
        'icon icon-' + data.icon
      )}"></span></div>`
    }

    html += `
    <div class="${c(data.type + ' log-item')}">
      ${indent}
      ${icon}
      <div class="${c('count-container hidden')}">
        <div class="${c('count')}"></div>
      </div>    
      <div class="${c('log-content-wrapper')}">
        <div class="${c('log-content')}">${data.msg}</div>
      </div>
    </div>`

    return html
  }
  private formatTable(args: any[]) {
    const Value = '__LunaConsoleValue'
    const table = args[0]
    let filter = args[1]
    let columns: string[] = []

    if (isStr(filter)) filter = toArr(filter)
    if (!isArr(filter)) filter = null

    if (!isObj(table)) return this.formatCommon(args)

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
    if (isEmpty(columns)) return this.formatCommon(args)

    this.columns = columns

    return (
      this.console.c('<div class="data-grid"></div>') +
      this.formatPreview(table)
    )
  }
  private formatErr(err: Error) {
    let lines = err.stack ? err.stack.split('\n') : []
    const msg = `${err.message || lines[0]}<br/>`

    lines = lines.map((val: string) => escape(val))

    const stack = `<div class="${this.console.c('stack hidden')}">${lines
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
  private formatCommon(args: any[]) {
    const { c } = this.console
    const needStrSubstitution = isStr(args[0]) && args.length !== 1
    if (needStrSubstitution) args = this.substituteStr(args)

    for (let i = 0, len = args.length; i < len; i++) {
      let val = args[i]

      if (isEl(val)) {
        args[i] = this.formatEl(val)
      } else if (isFn(val)) {
        args[i] = this.formatFn(val)
      } else if (isRegExp(val)) {
        args[i] = `<span class="${c('regexp')}">${escape(toStr(val))}</span>`
      } else if (isObj(val)) {
        args[i] = this.formatPreview(val)
      } else if (isUndef(val)) {
        args[i] = `<span class="${c('undefined')}">undefined</span>`
      } else if (isNull(val)) {
        args[i] = `<span class="${c('null')}">null</span>`
      } else if (isNum(val)) {
        args[i] = `<span class="${c('number')}">${toStr(val)}</span>`
      } else if (typeof val === 'bigint') {
        args[i] = `<span class="${c('number')}">${toStr(val)}n</span>`
      } else if (isBool(val)) {
        args[i] = `<span class="${c('boolean')}">${toStr(val)}</span>`
      } else if (isSymbol(val)) {
        args[i] = `<span class="${c('symbol')}">${escape(toStr(val))}</span>`
      } else {
        val = toStr(val)
        if (i !== 0 || !needStrSubstitution) {
          val = escape(val)
        }
        if (val.length > 5000) {
          val = truncate(val, 5000, {
            separator: ' ',
            ellipsis: '…',
          })
        }
        args[i] = val
      }
    }

    return args.join(' ')
  }
  private formatDir(args: any[]) {
    if (isObj(args[0])) {
      return this.formatPreview(args[0])
    }
    return this.formatCommon(args)
  }
  private formatTableVal(val: any) {
    const { c } = this.console
    if (isObj(val)) return '{…}'
    if (isPrimitive(val))
      return toEl(`<div class="${c('preview')}">${getPreview(val)}</div>`)

    return toStr(val)
  }
  private formatPreview(obj: any) {
    const { c } = this.console

    const id = uniqId()
    if (this.lazyEvaluation) {
      this.objects[id] = obj
    } else {
      this.extractObj(obj, {}, (result: any) => {
        this.objects[id] = result
      })
    }

    const noPreview = contain(['dir', 'table'], this.type)
    let type = getObjType(obj)
    if (type === 'Array' && obj.length > 1) {
      type = `(${obj.length})`
      if (noPreview) {
        type = `Array${type}`
      }
    } else if (type === 'RegExp') {
      type = toStr(obj)
    } else if (isEl(obj)) {
      type = this.formatElName(obj)
    }

    return (
      `<div class="${c('preview')}" data-id="${id}">` +
      `<div class="${c('preview-container')}">` +
      `<div class="${c('preview-icon-container')}"><span class="${c(
        'icon icon-caret-right'
      )}"></span></div>` +
      `<span class="${c('preview-content-container')}">` +
      `<span class="${c('descriptor')}">${escape(type)}</span> ` +
      `<span class="${c('object-preview')}">${
        noPreview
          ? ''
          : getPreview(obj, {
              getterVal: this.accessGetter,
              unenumerable: false,
            })
      }</span>` +
      '</span></div>' +
      `<div class="${c('json hidden')}"></div></div>`
    )
  }
  private substituteStr(args: any[]) {
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
              newStr += this.formatPreview(arg)
            }
            break
          case 'o':
            if (isEl(arg)) {
              newStr += this.formatEl(arg)
            } else if (isObj(arg)) {
              newStr += this.formatPreview(arg)
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
  private formatJs(val: string) {
    return `<pre class="${this.console.c('code')}">${this.console.c(
      highlight(val, 'js', emptyHighlightStyle)
    )}</pre>`
  }
  private formatFn(val: types.AnyFn) {
    return `<pre style="display:inline">${this.formatJs(val.toString())}</pre>`
  }
  private formatElName(val: HTMLElement) {
    const { id, className } = val

    let ret = val.tagName.toLowerCase()

    if (id !== '') ret += `#${id}`

    if (isStr(className)) {
      let classes = ''
      each(className.split(/\s+/g), (val) => {
        if (val.trim() === '') return
        classes += `.${val}`
      })
      ret += classes
    }

    return ret
  }
  private formatEl(val: HTMLElement) {
    const id = uniqId()
    this.elements[id] = val

    return this.console.c(`<div class="dom-viewer" data-id="${id}"></div>`)
  }
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

function stringify(obj: any, options: any, cb: Function) {
  const result = stringifyAll(obj, options)
  nextTick(() => cb(result))
}
