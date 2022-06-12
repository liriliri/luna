import Component, { IComponentOptions } from '../share/Component'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import $ from 'licia/$'
import last from 'licia/last'
import trim from 'licia/trim'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import types from 'licia/types'
import startWith from 'licia/startWith'
import throttle from 'licia/throttle'
import copy from 'licia/copy'

hljs.configure({
  classPrefix: 'luna-syntax-highlighter-',
})
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Code to highlight. */
  code?: string
  /** Language to highlight code in. */
  language?: string
  /** Show line numbers. */
  showLineNumbers?: boolean
  /** Wrap lone lines. */
  wrapLongLines?: boolean
}

/**
 * Syntax highlighter using highlightjs.
 *
 * @example
 * const syntaxHighlighter = new LunaSyntaxHighlighter(container)
 * syntaxHighlighter.setOption({
 *   code: 'const a = 1;',
 *   language: 'javascript',
 * })
 */
export default class SyntaxHighlighter extends Component {
  private render: types.AnyFn
  private $code: $.$
  private $copy: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'syntax-highlighter' }, options)

    let code = ''
    let language = 'javascript'
    if (!options.code && container.tagName === 'PRE') {
      const $code = this.$container.find('code')
      if (!isEmpty($code)) {
        code = $code.text()
        const className = $code.attr('class') || ''
        if (startWith(className, 'language-')) {
          language = className.replace('language-', '')
        }
      }
    }

    this.initOptions(options, {
      code,
      language,
      showLineNumbers: true,
      wrapLongLines: true,
    })

    this.render = throttle(() => this._render(), 16)

    this.initTpl()
    this.$code = this.find('.code')
    this.$copy = this.find('.copy')

    if (this.options.code) {
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
        `<code class="code"></code><div class="copy"><span class="icon icon-copy"></span></div>`
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

    copy(this.options.code)
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
    const { c, $copy, $code } = this
    const { code, language, showLineNumbers, wrapLongLines } = this.options

    if (wrapLongLines) {
      $code.addClass(c('wrap-long-lines'))
    } else {
      $code.rmClass(c('wrap-long-lines'))
    }

    const highlightCode = hljs.highlight(code, { language }).value
    if (!showLineNumbers) {
      $code.rmClass(c('line-numbers'))
      return this.$code.html(highlightCode)
    }

    $code.addClass(c('line-numbers'))
    let lines = getLines(highlightCode)
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
        line || ' '
      }</div></div>`
    })

    $code.html(`<div class="${c('table')}">${body}</div>`)

    this.updateCopyPos()
  }
  /**
   * Highlight.js registerLanguage.
   * @static
   */
  static registerLanguage(name: string, fn: types.AnyFn) {
    hljs.registerLanguage(name, fn)
  }
  /**
   * Highlight.js getLanguage.
   * @static
   */
  static getLanguage(name: string): any {
    return hljs.getLanguage(name)
  }
}

const regBreakLine = /\r\n|\r|\n/g
function getLines(code: string) {
  if (code.length === 0) {
    return []
  }

  return code.split(regBreakLine)
}

module.exports = SyntaxHighlighter
module.exports.default = SyntaxHighlighter
