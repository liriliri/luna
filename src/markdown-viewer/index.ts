import Component, { IComponentOptions } from '../share/Component'
import MarkdownIt from 'markdown-it'
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
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'markdown-viewer' }, options)

    this.initOptions(options, {
      markdown: '',
    })

    this.render()

    this.bindEvent()
  }
  private render() {
    this.destroySubComponents()

    const { $container } = this
    const { markdown } = this.options
    $container.html(this.md.render(markdown))
    const $codes = $container.find('pre code')
    const self = this
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

      self.addSubComponent(
        new LunaSyntaxHighlighter(pre.get(0) as HTMLElement)
      )
    })
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'markdown':
          this.render()
          break
      }
    })
  }
}

module.exports = MarkdownViewer
module.exports.default = MarkdownViewer
