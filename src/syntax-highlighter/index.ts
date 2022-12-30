import Component, { IComponentOptions } from '../share/Component'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import isEmpty from 'licia/isEmpty'
import types from 'licia/types'
import startWith from 'licia/startWith'
import LunaTextViewer from 'luna-text-viewer'
import { exportCjs } from '../share/util'

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
  /** Max viewer height. */
  maxHeight?: number
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
  private textViewer: LunaTextViewer
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
      maxHeight: Infinity,
    })

    this.textViewer = new LunaTextViewer(container, {
      text: this.getHighlightCode(this.options.code),
      escape: false,
      showLineNumbers: this.options.showLineNumbers,
      wrapLongLines: this.options.wrapLongLines,
      maxHeight: this.options.maxHeight,
    })
    this.addSubComponent(this.textViewer)

    this.bindEvent()
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'code':
          val = this.getHighlightCode(val)
          this.textViewer.setOption('text', val)
          break
        case 'showLineNumbers':
        case 'wrapLongLines':
        case 'maxHeight':
          this.textViewer.setOption(name, val)
          break
      }
    })
  }
  private getHighlightCode(code: string) {
    return hljs.highlight(code, { language: this.options.language }).value
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

if (typeof module !== 'undefined') {
  exportCjs(module, SyntaxHighlighter)
}
