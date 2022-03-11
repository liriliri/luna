import Component, { IComponentOptions } from '../share/Component'
import MarkdownIt from 'markdown-it'
import each from 'licia/each'
import $ from 'licia/$'
import startWith from 'licia/startWith'
import LunaSyntaxHighlighter from 'luna-syntax-highlighter'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Markdown text to render. */
  markdown?: string
}

/**
 * Live markdown renderer.
 *
 * @example
 * const markdownViewer = new LunaMarkdownViewer(container)
 * markdownViewer.setOption({ markdown: '# h1' })
 */
export default class MarkdownViewer extends Component<IOptions> {
  private md: MarkdownIt = new MarkdownIt({
    linkify: true,
  })
  private syntaxHighligters: LunaSyntaxHighlighter[] = []
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'markdown-viewer' }, options)

    this.initOptions(options, {
      markdown: '',
    })

    this.render()

    this.bindEvent()
  }
  destroy() {
    this.destroySyntaxHighlighters()
    super.destroy()
  }
  private render() {
    this.destroySyntaxHighlighters()

    const { $container, syntaxHighligters } = this
    const { theme, markdown } = this.options
    $container.html(this.md.render(markdown))
    const $codes = $container.find('pre code')
    $codes.each(function (this: HTMLElement) {
      const $code = $(this)
      const className = $code.attr('class') || ''
      if (!startWith(className, 'language-')) {
        return
      }
      const language = className.replace('language-', '')
      if (!LunaSyntaxHighlighter.getLanguage(language)) {
        return
      }
      const pre = $code.parent()
      syntaxHighligters.push(
        new LunaSyntaxHighlighter(pre.get(0) as HTMLElement, {
          theme,
        })
      )
    })
  }
  private destroySyntaxHighlighters() {
    each(this.syntaxHighligters, (syntaxHighlighter) =>
      syntaxHighlighter.destroy()
    )
    this.syntaxHighligters = []
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'markdown':
          this.render()
          break
        case 'theme':
          each(this.syntaxHighligters, (syntaxHighligter) =>
            syntaxHighligter.setOption('theme', val)
          )
          break
      }
    })
  }
}

module.exports = MarkdownViewer
module.exports.default = MarkdownViewer
