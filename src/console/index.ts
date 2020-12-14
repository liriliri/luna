import Log, { IGroup, IHeader, ILogOptions } from './Log'
import Emitter from 'licia/Emitter'
import isNum from 'licia/isNum'
import isUndef from 'licia/isUndef'
import perfNow from 'licia/perfNow'
import now from 'licia/now'
import isStr from 'licia/isStr'
import extend from 'licia/extend'
import uniqId from 'licia/uniqId'
import isRegExp from 'licia/isRegExp'
import isFn from 'licia/isFn'
import $ from 'licia/$'
import Stack from 'licia/Stack'
import isEmpty from 'licia/isEmpty'
import contain from 'licia/contain'
import copy from 'licia/copy'
import each from 'licia/each'
import toArr from 'licia/toArr'
import keys from 'licia/keys'
import last from 'licia/last'
import throttle from 'licia/throttle'
import raf from 'licia/raf'
import xpath from 'licia/xpath'
import lowerCase from 'licia/lowerCase'
import dateFormat from 'licia/dateFormat'
import isHidden from 'licia/isHidden'
import stripIndent from 'licia/stripIndent'
import { classPrefix } from '../share/util'

const u = navigator.userAgent
const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
const c = classPrefix('console')

let id = 0

type InsertOptions = Partial<ILogOptions> & { type: string; args: any[] }
type AsyncItem = [
  string | InsertOptions,
  any[] | undefined,
  IHeader | undefined
]

export = class Console extends Emitter {
  private $container: $.$
  private container: HTMLElement
  private $el: $.$
  private el: HTMLElement
  private $fakeEl: $.$
  private fakeEl: HTMLElement
  private $space: $.$
  private space: HTMLElement
  private spaceHeight = 0
  private topSpaceHeight = 0
  // @ts-ignore
  private bottomSpaceHeight = 0
  private lastScrollTop = 0
  private lastTimestamp = 0
  private speedToleranceFactor = 100
  private maxSpeedTolerance = 2000
  private minSpeedTolerance = 100
  private logs: Log[] = []
  private displayLogs: Log[] = []
  private timer: { [key: string]: number } = {}
  private counter: { [key: string]: number } = {}
  private lastLog?: Log
  private asyncRender = false
  private asyncList: AsyncItem[] = []
  private asyncTimer: any = null
  private isAtBottom = true
  private groupStack = new Stack()
  private renderViewport: (options?: any) => void
  private global: any
  private _filter: any = 'all'
  private _maxNum: string | number = 'infinite'
  private _displayHeader = false
  constructor(container: HTMLElement) {
    super()

    this.container = container
    const $container = $(container)
    this.$container = $container
    $container.addClass('luna-console')

    this.appendTpl()

    this.$el = $container.find(`.${c('logs')}`)
    this.el = this.$el.get(0) as HTMLElement
    this.$fakeEl = $container.find(`.${c('fake-logs')}`)
    this.fakeEl = this.$fakeEl.get(0) as HTMLElement
    this.$space = $container.find(`.${c('logs-space')}`)
    this.space = this.$space.get(0) as HTMLElement

    // For android slowing rendering
    if (isAndroid) {
      this.speedToleranceFactor = 800
      this.maxSpeedTolerance = 3000
      this.minSpeedTolerance = 800
    }

    this.renderViewport = throttle((options) => {
      this._renderViewport(options)
    }, 16)

    // https://developers.google.cn/web/tools/chrome-devtools/console/utilities
    this.global = {
      copy(value: string) {
        if (!isStr(value)) value = JSON.stringify(value, null, 2)
        copy(value)
      },
      $(selectors: string) {
        return document.querySelector(selectors)
      },
      $$(selectors: string) {
        return toArr(document.querySelectorAll(selectors))
      },
      $x(path: string) {
        return xpath(path)
      },
      clear: () => {
        this.clear()
      },
      dir: (value: any) => {
        this.dir(value)
      },
      table: (data: any, columns: any) => {
        this.table(data, columns)
      },
      keys,
    }

    this.bindEvent()
  }
  renderAsync(flag: boolean) {
    this.asyncRender = flag
  }
  setGlobal(name: string, val: any) {
    this.global[name] = val
  }
  displayHeader(flag: boolean) {
    this._displayHeader = flag
  }
  maxNum(val: number | string) {
    const { logs } = this

    this._maxNum = val
    if (isNum(val) && logs.length > val) {
      this.logs = logs.slice(logs.length - (val as number))
      this.render()
    }
  }
  displayUnenumerable(flag: boolean) {
    Log.showUnenumerable = flag
  }
  displayGetterVal(flag: boolean) {
    Log.showGetterVal = flag
  }
  lazyEvaluation(flag: boolean) {
    Log.lazyEvaluation = flag
  }
  viewLogInSources(flag: boolean) {
    Log.showSrcInSources = flag
  }
  destroy() {}
  filter(val: any) {
    this._filter = val
    this.emit('filter', val)

    return this.render()
  }
  count(label = 'default') {
    const { counter } = this

    !isUndef(counter[label]) ? counter[label]++ : (counter[label] = 1)

    return this.info(`${label}: ${counter[label]}`)
  }
  countReset(label = 'default') {
    this.counter[label] = 0

    return this
  }
  assert(...args: any[]) {
    if (isEmpty(args)) return

    const exp = args.shift()

    if (!exp) {
      if (args.length === 0) args.unshift('console.assert')
      args.unshift('Assertion failed: ')
      return this.insert('error', args)
    }
  }
  log(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('log', args)
  }
  debug(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('debug', args)
  }
  dir(obj: any) {
    if (isUndef(obj)) return

    return this.insert('dir', [obj])
  }
  table(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('table', args)
  }
  time(name = 'default') {
    if (this.timer[name]) {
      return this.insert('warn', [`Timer '${name}' already exists`])
    }
    this.timer[name] = perfNow()

    return this
  }
  timeLog(name = 'default') {
    const startTime = this.timer[name]

    if (!startTime) {
      return this.insert('warn', [`Timer '${name}' does not exist`])
    }

    return this.info(`${name}: ${perfNow() - startTime}ms`)
  }
  timeEnd(name = 'default') {
    this.timeLog(name)

    delete this.timer[name]

    return this
  }
  clear() {
    this.silentClear()

    return this.insert('log', [
      '%cConsole was cleared',
      'color:#808080;font-style:italic;',
    ])
  }
  silentClear() {
    this.logs = []
    this.displayLogs = []
    this.lastLog = undefined
    this.counter = {}
    this.timer = {}
    this.groupStack = new Stack()
    this.asyncList = []
    if (this.asyncTimer) {
      clearTimeout(this.asyncTimer)
      this.asyncTimer = null
    }

    return this.render()
  }
  info(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('info', args)
  }
  error(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('error', args)
  }
  warn(...args: any[]) {
    if (isEmpty(args)) return

    return this.insert('warn', args)
  }
  group(...args: any[]) {
    return this.insert({
      type: 'group',
      args,
      ignoreFilter: true,
    })
  }
  groupCollapsed(...args: any[]) {
    return this.insert({
      type: 'groupCollapsed',
      args,
      ignoreFilter: true,
    })
  }
  groupEnd() {
    this.insert('groupEnd')
  }
  input(jsCode: string) {
    this.insert({
      type: 'input',
      args: [jsCode],
      ignoreFilter: true,
    })

    try {
      this.output(this._evalJs(jsCode))
    } catch (e) {
      this.insert({
        type: 'error',
        ignoreFilter: true,
        args: [e],
      })
    }

    return this
  }
  output(val: string) {
    return this.insert({
      type: 'output',
      args: [val],
      ignoreFilter: true,
    })
  }
  html(...args: any) {
    return this.insert('html', args)
  }
  render() {
    const { logs } = this

    this.$el.html('')
    this.isAtBottom = true
    this._updateBottomSpace(0)
    this._updateTopSpace(0)
    this.displayLogs = []
    for (let i = 0, len = logs.length; i < len; i++) {
      this._attachLog(logs[i])
    }

    return this
  }
  insert(type: string | InsertOptions, args?: any[]) {
    let header
    if (this._displayHeader) {
      header = {
        time: getCurTime(),
        from: getFrom(),
      }
    }

    if (this.asyncRender) {
      return this.insertAsync(type, args, header)
    }

    this.insertSync(type, args, header)
  }
  insertAsync(type: string | InsertOptions, args?: any[], header?: IHeader) {
    this.asyncList.push([type, args, header])

    this._handleAsyncList()
  }
  insertSync(type: string | InsertOptions, args?: any[], header?: IHeader) {
    const { logs, groupStack } = this

    let options: InsertOptions
    if (isStr(type)) {
      options = {
        type: type as string,
        args: args as any[],
        header,
      }
    } else {
      options = type as InsertOptions
    }

    // Because asynchronous rendering, groupEnd must be put here.
    if (options.type === 'groupEnd') {
      const lastLog = this.lastLog as Log
      lastLog.groupEnd()
      this.groupStack.pop()
      return this
    }

    if (groupStack.size > 0) {
      options.group = groupStack.peek()
    }
    extend(options, {
      id: ++id,
    })

    if (options.type === 'group' || options.type === 'groupCollapsed') {
      const group = {
        id: uniqId('group'),
        collapsed: false,
        parent: groupStack.peek(),
        indentLevel: groupStack.size + 1,
      }
      if (options.type === 'groupCollapsed') group.collapsed = true
      options.targetGroup = group
      groupStack.push(group)
    }

    let log = new Log(options as ILogOptions)
    log.on('updateSize', () => {
      this.isAtBottom = false
      this.renderViewport()
    })

    const lastLog = this.lastLog
    if (
      lastLog &&
      !contain(['html', 'group', 'groupCollapsed'], log.type) &&
      lastLog.type === log.type &&
      !log.src &&
      !log.args &&
      lastLog.text() === log.text()
    ) {
      lastLog.addCount()
      if (log.header) lastLog.updateTime(log.header.time)
      log = lastLog
      this._detachLog(lastLog)
    } else {
      logs.push(log)
      this.lastLog = log
    }

    if (this._maxNum !== 'infinite' && logs.length > this._maxNum) {
      const firstLog = logs[0]
      this._detachLog(firstLog)
      logs.shift()
    }

    this._attachLog(log)

    this.emit('insert', log)

    return this
  }
  toggleGroup(log: Log) {
    const { targetGroup } = log
    ;(targetGroup as IGroup).collapsed
      ? this._openGroup(log)
      : this._collapseGroup(log)
  }
  _updateTopSpace(height: number) {
    this.topSpaceHeight = height
    this.el.style.top = height + 'px'
  }
  _updateBottomSpace(height: number) {
    this.bottomSpaceHeight = height
  }
  _updateSpace(height: number) {
    if (this.spaceHeight === height) return
    this.spaceHeight = height
    this.space.style.height = height + 'px'
  }
  _detachLog(log: Log) {
    const { displayLogs } = this

    const idx = displayLogs.indexOf(log)
    if (idx > -1) {
      displayLogs.splice(idx, 1)
      this.renderViewport()
    }
  }
  // Binary search
  _attachLog(log: Log) {
    if (!this._filterLog(log) || log.collapsed) return

    const { displayLogs } = this

    if (displayLogs.length === 0) {
      displayLogs.push(log)
      this.renderViewport()
      return
    }

    const lastDisplayLog = last(displayLogs)
    if (log.id > lastDisplayLog.id) {
      displayLogs.push(log)
      this.renderViewport()
      return
    }

    let startIdx = 0
    let endIdx = displayLogs.length - 1

    let middleLog: any
    let middleIdx = 0

    while (startIdx <= endIdx) {
      middleIdx = startIdx + Math.floor((endIdx - startIdx) / 2)
      middleLog = displayLogs[middleIdx]

      if (middleLog.id === log.id) {
        return
      }

      if (middleLog.id < log.id) {
        startIdx = middleIdx + 1
      } else {
        endIdx = middleIdx - 1
      }
    }

    if (middleLog.id < log.id) {
      displayLogs.splice(middleIdx + 1, 0, log)
    } else {
      displayLogs.splice(middleIdx, 0, log)
    }

    this.renderViewport()
  }
  _handleAsyncList(timeout = 20) {
    const asyncList = this.asyncList

    if (this.asyncTimer) return

    this.asyncTimer = setTimeout(() => {
      this.asyncTimer = null
      let done = false
      const len = asyncList.length
      // insert faster if logs is huge, thus takes more time to render.
      let timeout: number, num
      if (len < 1000) {
        num = 200
        timeout = 400
      } else if (len < 5000) {
        num = 500
        timeout = 800
      } else if (len < 10000) {
        num = 800
        timeout = 1000
      } else if (len < 25000) {
        num = 1000
        timeout = 1200
      } else if (len < 50000) {
        num = 1500
        timeout = 1500
      } else {
        num = 2000
        timeout = 2500
      }
      if (num > len) {
        num = len
        done = true
      }
      for (let i = 0; i < num; i++) {
        const [type, args, header] = asyncList.shift() as AsyncItem
        this.insertSync(type, args, header)
      }
      if (!done) raf(() => this._handleAsyncList(timeout))
    }, timeout)
  }
  _injectGlobal() {
    each(this.global, (val, name) => {
      if (window[name]) return
      ;(window as any)[name] = val
    })
  }
  _clearGlobal() {
    each(this.global, (val, name) => {
      if (window[name] && window[name] === val) {
        delete window[name]
      }
    })
  }
  _evalJs(jsInput: string) {
    let ret

    this._injectGlobal()
    try {
      ret = eval.call(window, `(${jsInput})`)
    } catch (e) {
      ret = eval.call(window, jsInput)
    }
    this.setGlobal('$_', ret)
    this._clearGlobal()

    return ret
  }
  _filterLog(log: Log) {
    const filter = this._filter

    if (filter === 'all') return true

    const isFilterRegExp = isRegExp(filter)
    const isFilterFn = isFn(filter)

    if (log.ignoreFilter) return true
    if (isFilterFn) return filter(log)
    if (isFilterRegExp) return filter.test(lowerCase(log.text()))

    return log.type === filter
  }
  _getLog(id: number) {
    const { logs } = this
    let log

    for (let i = 0, len = logs.length; i < len; i++) {
      log = logs[i]
      if (log.id === id) break
    }

    return log
  }
  _collapseGroup(log: Log) {
    const { targetGroup } = log
    ;(targetGroup as IGroup).collapsed = true
    log.updateIcon('arrow-right')

    this._updateGroup(log)
  }
  _openGroup(log: Log) {
    const { targetGroup } = log
    ;(targetGroup as IGroup).collapsed = false
    log.updateIcon('arrow-down')

    this._updateGroup(log)
  }
  _updateGroup(log: Log) {
    const { targetGroup } = log
    const { logs } = this
    const len = logs.length
    let i = logs.indexOf(log) + 1
    while (i < len) {
      const log = logs[i]
      if (!log.checkGroup() && log.group === targetGroup) {
        break
      }
      log.collapsed ? this._detachLog(log) : this._attachLog(log)
      i++
    }
  }
  private bindEvent() {
    const self = this
    const { $el } = this

    $el.on('click', `.${c('log-container')}`, function (this: any) {
      this.log.click(self)
    })

    this.$container.on('scroll', () => {
      const { scrollHeight, offsetHeight, scrollTop } = this.container
      // safari bounce effect
      if (scrollTop <= 0) return
      if (offsetHeight + scrollTop > scrollHeight) return

      let isAtBottom = false
      if (scrollHeight === offsetHeight) {
        isAtBottom = true
      } else if (scrollTop === scrollHeight - offsetHeight) {
        isAtBottom = true
      }
      this.isAtBottom = isAtBottom

      const lastScrollTop = this.lastScrollTop
      const lastTimestamp = this.lastTimestamp

      const timestamp = now()
      const duration = timestamp - lastTimestamp
      const distance = scrollTop - lastScrollTop
      const speed = Math.abs(distance / duration)
      let speedTolerance = speed * this.speedToleranceFactor
      if (duration > 1000) {
        speedTolerance = 1000
      }
      if (speedTolerance > this.maxSpeedTolerance) {
        speedTolerance = this.maxSpeedTolerance
      }
      if (speedTolerance < this.minSpeedTolerance) {
        speedTolerance = this.minSpeedTolerance
      }
      this.lastScrollTop = scrollTop
      this.lastTimestamp = timestamp

      let topTolerance = 0
      let bottomTolerance = 0
      if (lastScrollTop < scrollTop) {
        topTolerance = this.minSpeedTolerance
        bottomTolerance = speedTolerance
      } else {
        topTolerance = speedTolerance
        bottomTolerance = this.minSpeedTolerance
      }

      if (
        this.topSpaceHeight < scrollTop - topTolerance &&
        this.topSpaceHeight + this.el.offsetHeight >
          scrollTop + offsetHeight + bottomTolerance
      ) {
        return
      }

      this.renderViewport({
        topTolerance: topTolerance * 2,
        bottomTolerance: bottomTolerance * 2,
      })
    })
  }
  _renderViewport({ topTolerance = 500, bottomTolerance = 500 } = {}) {
    const { el, container } = this
    if (isHidden(container)) return
    const { scrollTop, clientWidth, offsetHeight } = container
    const top = scrollTop - topTolerance
    const bottom = scrollTop + offsetHeight + bottomTolerance

    const { displayLogs } = this

    let topSpaceHeight = 0
    let bottomSpaceHeight = 0
    let currentHeight = 0

    const len = displayLogs.length

    const { fakeEl } = this
    const fakeFrag = document.createDocumentFragment()
    const logs = []
    for (let i = 0; i < len; i++) {
      const log = displayLogs[i]
      const { width, height } = log
      if (height === 0 || width !== clientWidth) {
        fakeFrag.appendChild(log.el)
        logs.push(log)
      }
    }
    if (logs.length > 0) {
      fakeEl.appendChild(fakeFrag)
      console.log(fakeFrag)
      for (let i = 0, len = logs.length; i < len; i++) {
        logs[i].updateSize()
      }
      fakeEl.innerHTML = ''
    }

    const frag = document.createDocumentFragment()
    for (let i = 0; i < len; i++) {
      const log = displayLogs[i]
      const { el, height } = log

      if (currentHeight > bottom) {
        bottomSpaceHeight += height
      } else if (currentHeight + height > top) {
        frag.appendChild(el)
      } else if (currentHeight < top) {
        topSpaceHeight += height
      }

      currentHeight += height
    }

    this._updateSpace(currentHeight)
    this._updateTopSpace(topSpaceHeight)
    this._updateBottomSpace(bottomSpaceHeight)

    while (el.firstChild) {
      if (el.lastChild) {
        el.removeChild(el.lastChild)
      }
    }
    el.appendChild(frag)

    const { scrollHeight } = container
    if (this.isAtBottom && scrollTop <= scrollHeight - offsetHeight) {
      container.scrollTop = 10000000
    }
  }
  private appendTpl() {
    this.$container.html(stripIndent`
      <div class="${c('logs-space')}">
        <div class="${c('fake-logs')}"></div>
        <div class="${c('logs')}"></div>
      </div>
    `)
  }
}

const getCurTime = () => dateFormat('HH:MM:ss ')

function getFrom() {
  const e = new Error()
  let ret = ''
  const lines = e.stack ? e.stack.split('\n') : ''

  for (let i = 0, len = lines.length; i < len; i++) {
    ret = lines[i]
    if (ret.indexOf('winConsole') > -1 && i < len - 1) {
      ret = lines[i + 1]
      break
    }
  }

  return ret
}
