import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import last from 'licia/last'
import trim from 'licia/trim'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import types from 'licia/types'
import throttle from 'licia/throttle'
import debounce from 'licia/debounce'
import copy from 'licia/copy'
import escape from 'licia/escape'
import unescape from 'licia/unescape'
import stripHtmlTag from 'licia/stripHtmlTag'
import { exportCjs, hasTouchSupport } from '../share/util'

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
  /** Max viewer height. */
  maxHeight?: number
}

/**
 * Text viewer with line number.
 *
 * @example
 * const textViewer = new LunaTextViewer(container)
 * textViewer.setOption({
 *   text: 'Luna Text Viewer',
 * })
 */
export default class TextViewer extends Component {
  private render: types.AnyFn
  private updateCopyPos: types.AnyFn
  private $text: $.$
  private $copy: $.$
  private lineNum = 0
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'text-viewer' }, options)

    this.initOptions(options, {
      text: '',
      escape: true,
      showLineNumbers: true,
      wrapLongLines: true,
      maxHeight: Infinity,
    })

    this.render = throttle(() => this._render(), 16)
    this.updateCopyPos = debounce(() => this._updateCopyPos(), 300)

    this.initTpl()
    this.$text = this.find('.text')
    this.$copy = this.find('.copy')

    if (hasTouchSupport) {
      this.$copy.css('opacity', '1')
    }

    if (this.options.text) {
      this.render()
    }

    this.bindEvent()
    this.updateHeight()
  }
  /** Append text. */
  append(text: string) {
    const { options, $copy, c, $text } = this
    const { showLineNumbers } = options
    this.options.text += text

    if (!showLineNumbers) {
      return this.$text.append(options.escape ? escape(text) : text)
    }

    let lines = getLines(text)
    if (isEmpty(lines)) {
      lines = ['&nbsp;']
    }

    if (!trim(last(lines))) {
      lines.pop()
    }
    let body = ''
    each(lines, (line) => {
      this.lineNum += 1
      body += `<div class="${c('table-row')}"><div class="${c(
        'line-number'
      )}">${this.lineNum}</div><div class="${c('line-text')}">${
        options.escape ? escape(line) : line || ' '
      }</div></div>`
    })

    $text.find(c('.table')).append(body)

    $copy.hide()
    if ($text.offset().height > 40) {
      $copy.show()
    }

    this.updateCopyPos()
  }
  destroy() {
    this.$container.off('scroll', this.updateCopyPos)
    super.destroy()
  }
  private updateHeight() {
    const { maxHeight } = this.options
    if (maxHeight > 0 && maxHeight !== Infinity) {
      this.$text.css('max-height', maxHeight)
    } else {
      this.$text.css('max-height', 'none')
    }
  }
  private initTpl() {
    this.$container.html(
      this.c(
        `<div class="text"></div><div class="copy"><span class="icon icon-copy"></span></div>`
      )
    )
  }
  private bindEvent() {
    this.on('optionChange', (name) => {
      switch (name) {
        case 'maxHeight':
          this.updateHeight()
          break
        default:
          this.render()
          break
      }
    })
    this.$container.on('scroll', this.updateCopyPos)
    this.$copy.on('click', this.copy)
  }
  private copy = () => {
    const { c } = this
    const { text, escape } = this.options

    copy(escape ? text : unescape(stripHtmlTag(text)))
    const $icon = this.$copy.find(c('.icon'))
    $icon.addClass(c('icon-check')).rmClass(c('icon-copy'))
    setTimeout(() => {
      $icon.rmClass(c('icon-check')).addClass(c('icon-copy'))
    }, 1000)
  }
  private _updateCopyPos = () => {
    const { container } = this

    this.$copy.css({
      top: container.scrollTop + 5,
      right: -container.scrollLeft + 5,
    })
  }
  private _render() {
    const { c, $text, options } = this
    const { text, wrapLongLines, showLineNumbers } = options

    if (wrapLongLines) {
      $text.addClass(c('wrap-long-lines'))
    } else {
      $text.rmClass(c('wrap-long-lines'))
    }

    if (!showLineNumbers) {
      $text.rmClass(c('line-numbers'))
    } else {
      $text.addClass(c('line-numbers'))
    }

    $text.html(`<div class="${c('table')}"></div>`)
    this.lineNum = 0
    this.options.text = ''
    this.append(text)
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
