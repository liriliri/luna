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
import toNum from 'licia/toNum'
import omit from 'licia/omit'
import ResizeSensor from 'licia/ResizeSensor'
import debounce from 'licia/debounce'
import LunaVirtualList from 'luna-virtual-list'
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

export interface IEntry extends IBaseEntry {
  date: string | Date
}

interface IInnerEntry extends IBaseEntry {
  date: Date
  container: HTMLElement
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
  private render: types.AnyFn
  private entries: Array<IInnerEntry> = []
  private displayEntries: Array<IInnerEntry> = []
  private removeThreshold = 1
  private virtualList: LunaVirtualList
  private resizeSensor: ResizeSensor
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'logcat' }, options)

    this.initOptions(options, {
      maxNum: 10000,
      view: 'standard',
      entries: [],
      wrapLongLines: false,
    })

    this.resizeSensor = new ResizeSensor(container)

    this.initTpl()
    this.virtualList = new LunaVirtualList(
      this.find('.virtual-list').get(0) as HTMLElement,
      { autoScroll: true }
    )
    this.addSubComponent(this.virtualList)

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
    this.resizeSensor.destroy()
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
      idx: entries.length,
    }
    container.setAttribute('data-idx', String(e.idx))
    entries.push(e)

    const { maxNum, view } = this.options

    if (maxNum !== 0 && entries.length >= maxNum + this.removeThreshold) {
      for (let i = 0; i < this.removeThreshold; i++) {
        const entry = entries.shift()
        if (entry) {
          if (displayEntries[0] === entry) {
            displayEntries.shift()
            this.virtualList.remove(entry.container)
          }
        }
      }
    }

    container.innerHTML =
      view === 'standard' ? this.formatStandard(e) : this.formatCompact(e)

    if (this.filterEntry(e)) {
      this.displayEntries.push(e)
      this.virtualList.append(container)
    }
  }
  /** Clear all entries. */
  clear() {
    this.entries = []
    this.virtualList.clear()
  }
  /** Scroll to end. */
  scrollToEnd() {
    this.virtualList.scrollToEnd()
  }
  /** Check if there is any selection. */
  hasSelection() {
    const selection = window.getSelection()
    if (selection && selection.anchorNode) {
      if (
        this.container.contains(selection.anchorNode) &&
        selection.toString() !== ''
      ) {
        return true
      }
    }
    return false
  }
  /** Get selected text. */
  getSelection() {
    if (!this.hasSelection()) {
      return ''
    }
    const selection = window.getSelection()
    return selection ? selection.toString() : ''
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
  private initTpl() {
    this.$container.html(this.c('<div class="virtual-list"></div>'))
  }
  private bindEvent() {
    const { c } = this

    this.resizeSensor.addListener(
      debounce(() => this.virtualList.update(), 100)
    )

    this.on('changeOption', (name, val) => {
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

    const self = this

    this.$container
      .on('contextmenu', c('.entry'), function (this: HTMLDivElement, e) {
        e.stopPropagation()
        const idx = $(this).data('idx')
        const entry = self.entries[toNum(idx)]
        self.emit(
          'contextmenu',
          e.origEvent,
          omit(entry, (val: any, key: string) => {
            return key === 'container' || key === 'idx'
          })
        )
      })
      .on('contextmenu', (e) => {
        self.emit('contextmenu', e.origEvent)
      })
  }
  private formatStandard(entry: IInnerEntry) {
    const { c } = this

    return [
      `<span class="${c('date')}">${dateFormat(
        entry.date,
        'yyyy-mm-dd HH:MM:ss.l'
      )}</span>`,
      `<span class="${c('pid')}">${entry.pid}-${entry.tid}</span>`,
      `<span class="${c('tag')} ${c(getColor(entry.tag))}">${escape(
        entry.tag
      )}</span>`,
      `<span class="${c('package')}">${escape(entry.package)}</span>`,
      `<span class="${c('priority')}">${toLetter(entry.priority)}</span>`,
      `<span class="${c('message')}">${escape(trim(entry.message))}</span>`,
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
      `<span class="${c('message')}">${escape(trim(entry.message))}</span>`,
    ].join(' ')
  }
  private _render() {
    const { container } = this
    this.$container.html('')

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

const colors: string[] = []
each(
  [
    'blue',
    'purple',
    'cyan',
    'green',
    'magenta',
    'pink',
    'red',
    'orange',
    'yellow',
    'volcano',
    'geekblue',
    'gold',
    'lime',
  ],
  (color) => {
    for (let i = 6; i <= 10; i++) {
      colors.push(`color-${color}-${i}`)
    }
  }
)

if (typeof module !== 'undefined') {
  exportCjs(module, Logcat)
}
