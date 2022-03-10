import Component, { IComponentOptions } from '../share/Component'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import $ from 'licia/$'
import each from 'licia/each'
import types from 'licia/types'
import throttle from 'licia/throttle'

hljs.configure({
  classPrefix: 'luna-syntax-highlighter-',
})
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Code to highlight. */
  code: string
  /** Language to highlight code in. */
  language: string
  /** Show line numbers. */
  showLineNumbers?: boolean
  /** Wrap lone lines. */
  wrapLongLines?: boolean
}

/**
 * Syntax highlighter using highlightjs.
 */
export default class SyntaxHighlighter extends Component {
  private render: types.AnyFn
  private $code: $.$
  constructor(
    container: HTMLElement,
    options: IOptions = {
      code: '',
      language: '',
    }
  ) {
    super(container, { compName: 'syntax-highlighter' }, options)

    this.initOptions(options, {
      language: 'javascript',
      showLineNumbers: true,
      wrapLongLines: true,
    })

    this.render = throttle(() => this._render(), 16)

    this.initTpl()
    this.$code = this.find('.code')

    if (this.options.code) {
      this.render()
    }

    this.bindEvent()
  }
  /** Highlight.js registerLanguage. */
  registerLanguage(name: string, fn: types.AnyFn) {
    hljs.registerLanguage(name, fn)
  }
  private initTpl() {
    this.$container.html(this.c('<code class="code"></code>'))
  }
  private bindEvent() {
    this.on('optionChange', () => this.render())
  }
  private _render() {
    const { c } = this
    const { code, language, showLineNumbers, wrapLongLines } = this.options

    if (wrapLongLines) {
      this.$code.addClass(c('wrap-long-lines'))
    } else {
      this.$code.rmClass(c('wrap-long-lines'))
    }

    const highlightCode = hljs.highlight(code, { language }).value
    if (!showLineNumbers) {
      this.$code.rmClass(c('line-numbers'))
      return this.$code.html(highlightCode)
    }

    this.$code.addClass(c('line-numbers'))
    const lines = getLines(highlightCode)
    let body = ''
    each(lines, (line, idx) => {
      body += `<tr><td class="${c('line-number')}">${
        idx + 1
      }</td><td class="${c('line-code')}">${line || ' '}</td></tr>`
    })

    this.$code.html(`<table class="${c('table')}">${body}</table>`)
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
