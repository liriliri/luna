import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import last from 'licia/last'
import trim from 'licia/trim'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import types from 'licia/types'
import throttle from 'licia/throttle'
import copy from 'licia/copy'
import escape from 'licia/escape'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Text to view. */
  text?: string
  /** Whether to escape text or not. */
  escape?: boolean
  /** Show line numbers. */
  showLineNumbers?: boolean
  /** Wrap lone lines. */
  wrapLongLines?: boolean
}

/**
 * Text viewer with line number.
 *
 * @example
 * const textViewer = new LunaTextViewer(container)
 * textViewer.setOption({
 *   text: 'const a = 1;',
 * })
 */
export default class TextViewer extends Component {
  private render: types.AnyFn
  private $text: $.$
  private $copy: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'text-viewer' }, options)

    this.initOptions(options, {
      text: '',
      escape: true,
      showLineNumbers: true,
      wrapLongLines: true,
    })

    this.render = throttle(() => this._render(), 16)

    this.initTpl()
    this.$text = this.find('.text')
    this.$copy = this.find('.copy')

    if (this.options.text) {
      this.render()
    }

    this.bindEvent()
  }
  destroy() {
    this.$container.off('scroll', this.updateCopyPos)
    super.destroy()
  }
  private initTpl() {
    this.$container.html(
      this.c(
        `<div class="text"></div><div class="copy"><span class="icon icon-copy"></span></div>`
      )
    )
  }
  private bindEvent() {
    this.on('optionChange', () => this.render())
    this.$container.on('scroll', this.updateCopyPos)
    this.$copy.on('click', this.copy)
  }
  private copy = () => {
    const { c } = this

    copy(this.options.text)
    const $icon = this.$copy.find(c('.icon'))
    $icon.addClass(c('icon-check')).rmClass(c('icon-copy'))
    setTimeout(() => {
      $icon.rmClass(c('icon-check')).addClass(c('icon-copy'))
    }, 1000)
  }
  private updateCopyPos = () => {
    const { container } = this

    this.$copy.css({
      top: container.scrollTop + 5,
      right: -container.scrollLeft + 5,
    })
  }
  private _render() {
    const { c, $copy, $text, options } = this
    const { text, showLineNumbers, wrapLongLines } = options

    if (wrapLongLines) {
      $text.addClass(c('wrap-long-lines'))
    } else {
      $text.rmClass(c('wrap-long-lines'))
    }

    if (!showLineNumbers) {
      $text.rmClass(c('line-numbers'))
      return this.$text.html(options.escape ? escape(text) : text)
    }

    $text.addClass(c('line-numbers'))
    let lines = getLines(text)
    if (isEmpty(lines)) {
      lines = ['&nbsp;']
    }
    if (lines.length > 3) {
      $copy.show()
    } else {
      $copy.hide()
    }

    if (!trim(last(lines))) {
      lines.pop()
    }
    let body = ''
    each(lines, (line, idx) => {
      body += `<div class="${c('table-row')}"><div class="${c(
        'line-number'
      )}">${idx + 1}</div><div class="${c('line-code')}">${
        options.escape ? escape(line) : line || ' '
      }</div></div>`
    })

    $text.html(`<div class="${c('table')}">${body}</div>`)

    this.updateCopyPos()
  }
}

const regBreakLine = /\r\n|\r|\n/g
function getLines(text: string) {
  if (text.length === 0) {
    return []
  }

  return text.split(regBreakLine)
}

if (typeof module !== 'undefined') {
  exportCjs(module, TextViewer)
}
