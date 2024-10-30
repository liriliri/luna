import Component, { IComponentOptions } from '../share/Component'
import escape from 'licia/escape'
import h from 'licia/h'
import types from 'licia/types'
import throttle from 'licia/throttle'
import trim from 'licia/trim'
import isDate from 'licia/isDate'
import each from 'licia/each'
import strHash from 'licia/strHash'
import $ from 'licia/$'
import lowerCase from 'licia/lowerCase'
import contain from 'licia/contain'
import dateFormat from 'licia/dateFormat'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Max entry number, zero means infinite. */
  maxNum?: number
  /** Log filter. */
  filter?: IFilter
  /** Log entries. */
  entries?: IEntry[]
  /** Log formatting. */
  view?: 'standard' | 'compact'
  /** Wrap long lines. */
  wrapLongLines?: boolean
}

/** IFilter */
export interface IFilter {
  /** Entry priority. */
  priority?: number
  /** Package name. */
  package?: string
  /** Tag name. */
  tag?: string
}

interface IBaseEntry {
  package: string
  pid: number
  tid: number
  priority: number
  tag: string
  message: string
}

interface IEntry extends IBaseEntry {
  date: string | Date
}

interface IInnerEntry extends IBaseEntry {
  date: Date
  container: HTMLElement
}

const MIN_APPEND_INTERVAL = 100

/**
 * Android logcat viewer.
 *
 * @example
 * const logcat = new LunaLogcat(container)
 * logcatp.append({
 *   date: '2021-01-01 00:00:00',
 *   package: 'com.example',
 *   pid: 1234,
 *   tid: 1234,
 *   priority: 3,
 *   tag: 'tag',
 *   message: 'message',
 * })
 */
export default class Logcat extends Component<IOptions> {
  private isAtBottom = true
  private render: types.AnyFn
  private entries: Array<IInnerEntry> = []
  private displayEntries: Array<IInnerEntry> = []
  private appendTimer: NodeJS.Timeout | null = null
  private removeThreshold = 1
  private frag: DocumentFragment = document.createDocumentFragment()
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'logcat' })

    this.initOptions(options, {
      maxNum: 5000,
      view: 'standard',
      entries: [],
      wrapLongLines: false,
    })

    const maxNum = this.options.maxNum
    if (maxNum !== 0 && maxNum > 500) {
      this.removeThreshold = Math.round(maxNum / 10)
    }

    this.render = throttle(() => this._render(), 16)
    if (this.options.entries) {
      each(this.options.entries, (entry) => {
        this.append(entry)
      })
    }

    if (this.options.wrapLongLines) {
      this.$container.addClass(this.c('wrap-long-lines'))
    }

    this.bindEvent()
  }
  destroy() {
    this.$container.off('scroll', this.onScroll)
    super.destroy()
  }
  /** Append entry. */
  append(entry: IEntry) {
    const { c, entries, displayEntries } = this

    const date: Date = isDate(entry.date)
      ? (entry.date as Date)
      : new Date(entry.date)

    const container = h(`.${c('entry')}.${c(toLetter(entry.priority))}`)
    const e = {
      ...entry,
      date,
      container,
    }
    entries.push(e)

    const { maxNum, view } = this.options

    if (maxNum !== 0 && entries.length >= maxNum + this.removeThreshold) {
      for (let i = 0; i < this.removeThreshold; i++) {
        const entry = entries.shift()
        if (entry) {
          if (displayEntries[0] === entry) {
            displayEntries.shift()
            $(entry.container).remove()
          }
        }
      }
    }

    container.innerHTML =
      view === 'standard' ? this.formatStandard(e) : this.formatCompact(e)

    if (this.filterEntry(e)) {
      this.displayEntries.push(e)
      this.frag.appendChild(container)
      if (!this.appendTimer) {
        this.appendTimer = setTimeout(this._append, MIN_APPEND_INTERVAL)
      }
    }
  }
  /** Clear all entries. */
  clear() {
    if (this.appendTimer) {
      clearTimeout(this.appendTimer)
      this.appendTimer = null
      this.frag = document.createDocumentFragment()
    }
    this.entries = []
    this.$container.html('')
  }
  /** Scroll to end. */
  scrollToEnd() {
    const { container } = this
    const { scrollHeight, scrollTop, offsetHeight } = container
    if (scrollTop <= scrollHeight - offsetHeight) {
      container.scrollTop = 10000000
      this.isAtBottom = true
    }
  }
  private _append = () => {
    const isAtBottom = this.isAtBottom
    this.container.appendChild(this.frag)
    this.appendTimer = null
    if (isAtBottom) {
      this.scrollToEnd()
    }
  }
  private filterEntry(entry: IBaseEntry) {
    const { filter } = this.options

    if (!filter) {
      return true
    }

    if (filter.priority && entry.priority < filter.priority) {
      return false
    }

    const pkg = trim(filter.package || '')
    if (pkg) {
      if (!contain(lowerCase(entry.package), lowerCase(pkg))) {
        return false
      }
    }

    const tag = trim(filter.tag || '')
    if (tag) {
      if (!contain(lowerCase(entry.tag), lowerCase(tag))) {
        return false
      }
    }

    return true
  }
  private bindEvent() {
    const { c } = this

    this.on('optionChange', (name, val) => {
      const { entries } = this

      switch (name) {
        case 'wrapLongLines':
          if (val) {
            this.$container.addClass(c('wrap-long-lines'))
          } else {
            this.$container.rmClass(c('wrap-long-lines'))
          }
          break
        case 'maxNum':
          if (val > 0 && entries.length > val) {
            this.entries = entries.slice(entries.length - val)
            this.render()
          }
          break
        case 'view':
          each(entries, (entry) => {
            const html =
              val === 'standard'
                ? this.formatStandard(entry)
                : this.formatCompact(entry)

            entry.container.innerHTML = html
          })
          break
        case 'filter':
          this.displayEntries = []
          each(entries, (entry) => {
            if (this.filterEntry(entry)) {
              this.displayEntries.push(entry)
            }
          })
          this.render()
          break
      }
    })

    this.$container.on('scroll', this.onScroll)
  }
  private onScroll = () => {
    const { scrollHeight, clientHeight, scrollTop } = this
      .container as HTMLElement

    let isAtBottom = false
    if (scrollHeight === clientHeight) {
      isAtBottom = true
    } else if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      isAtBottom = true
    }
    this.isAtBottom = isAtBottom
  }
  private formatStandard(entry: IInnerEntry) {
    const { c } = this

    return [
      `<span class="${c('date')}">${dateFormat(
        entry.date,
        'yyyy-mm-dd HH:MM:ss.l'
      )}</span>`,
      `<span class="${c('pid')}">${entry.pid}-${entry.tid}</span>`,
      `<span class="${c('tag')}" style="color:${getColor(entry.tag)}">${escape(
        entry.tag
      )}</span>`,
      `<span class="${c('package')}">${escape(entry.package)}</span>`,
      `<span class="${c('priority')}">${toLetter(entry.priority)}</span>`,
      `<span class="${c('message')}">${escape(entry.message)}</span>`,
    ].join(' ')
  }
  private formatCompact(entry: IInnerEntry) {
    const { c } = this

    return [
      `<span class="${c('date')}">${dateFormat(
        entry.date,
        'HH:MM:ss.l'
      )}</span>`,
      `<span class="${c('priority')}">${toLetter(entry.priority)}</span>`,
      `<span class="${c('message')}">${escape(entry.message)}</span>`,
    ].join(' ')
  }
  private _render() {
    const { container } = this
    this.$container.html('')
    this.isAtBottom = true

    const frag = document.createDocumentFragment()
    each(this.displayEntries, (entry) => {
      frag.appendChild(entry.container)
    })
    container.appendChild(frag)

    this.scrollToEnd()
  }
}

function toLetter(priority: number) {
  return ['?', '?', 'V', 'D', 'I', 'W', 'E'][priority]
}

function getColor(str: string) {
  return colors[strHash(str) % colors.length]
}

const colors = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33',
]

if (typeof module !== 'undefined') {
  exportCjs(module, Logcat)
}
