import Component, { IComponentOptions } from '../share/Component'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import $ from 'licia/$'

hljs.configure({
  classPrefix: 'luna-syntax-highlighter-',
})
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Code to highlight. */
  code: string
  /** Language to highlight code in. */
  language: string
}

/**
 * Syntax highlighter using highlightjs.
 */
export default class SyntaxHighlighter extends Component {
  private $code: $.$
  constructor(
    container: HTMLElement,
    options: IOptions = {
      code: '',
      language: '',
    }
  ) {
    super(container, { compName: 'syntax-highlighter' }, options)

    this.initOptions(options)

    this.initTpl()
    this.$code = this.find('.code')

    if (this.options.code) {
      this.render()
    }
  }
  private initTpl() {
    this.$container.html(this.c('<code class="code"></code>'))
  }
  private render() {
    const { code, language } = this.options

    this.$code.html(hljs.highlight(code, { language }).value)
  }
}

module.exports = SyntaxHighlighter
module.exports.default = SyntaxHighlighter
