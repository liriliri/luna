import Component, { IComponentOptions } from '../share/Component'
import escape from 'licia/escape'
import h from 'licia/h'
import types from 'licia/types'
import throttle from 'licia/throttle'
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
  private entries: Array<{
    container: HTMLElement
    entry: IBaseEntry & { date: Date }
  }> = []
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'logcat' })

    this.initOptions(options, {
      maxNum: 0,
      entries: [],
      wrapLongLines: false,
    })

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
    const { c, entries } = this
    const { maxNum } = this.options

    const date: Date = isDate(entry.date)
      ? (entry.date as Date)
      : new Date(entry.date)

    const level = ['?', '?', 'V', 'D', 'I', 'W', 'E'][entry.priority]

    const container = h(`.${c('entry')}.${c(level)}`)
    const e = {
      ...entry,
      date,
    }
    entries.push({
      container,
      entry: e,
    })

    if (maxNum !== 0 && entries.length > maxNum) {
      const entry = entries.shift()
      if (entry) {
        $(entry.container).remove()
      }
    }

    const html = [
      `<span class="${c('date')}">${dateFormat(
        date,
        'yyyy-mm-dd HH:MM:ss.l'
      )}</span>`,
      `<span class="${c('pid')}">${entry.pid}-${entry.tid}</span>`,
      `<span class="${c('tag')}" style="color:${getColor(entry.tag)}">${escape(
        entry.tag
      )}</span>`,
      `<span class="${c('package')}">${escape(entry.package)}</span>`,
      `<span class="${c('priority')}">${level}</span>`,
      `<span class="${c('message')}">${escape(entry.message)}</span>`,
    ].join(' ')
    container.innerHTML = html

    if (this.filterEntry(e)) {
      this.container.appendChild(container)
      if (this.isAtBottom) {
        this.scrollToBottom()
      }
    }
  }
  /** Clear all entries. */
  clear() {
    this.entries = []
    this.$container.html('')
  }
  private scrollToBottom() {
    const { container } = this
    const { scrollHeight, scrollTop, offsetHeight } = container
    if (scrollTop <= scrollHeight - offsetHeight) {
      container.scrollTop = 10000000
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

    if (filter.package) {
      if (!contain(lowerCase(entry.package), lowerCase(filter.package))) {
        return false
      }
    }

    if (filter.tag) {
      if (!contain(lowerCase(entry.tag), lowerCase(filter.tag))) {
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
        case 'filter':
          this.render()
          break
      }
    })

    this.$container.on('scroll', this.onScroll)
  }
  private onScroll = () => {
    const { scrollHeight, offsetHeight, scrollTop } = this
      .container as HTMLElement

    let isAtBottom = false
    if (scrollHeight === offsetHeight) {
      isAtBottom = true
    } else if (Math.abs(scrollHeight - offsetHeight - scrollTop) < 1) {
      isAtBottom = true
    }
    this.isAtBottom = isAtBottom
  }
  private _render() {
    const { container } = this
    this.$container.html('')
    this.isAtBottom = true

    each(this.entries, (entry) => {
      if (this.filterEntry(entry.entry)) {
        container.appendChild(entry.container)
      }
    })

    this.scrollToBottom()
  }
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
