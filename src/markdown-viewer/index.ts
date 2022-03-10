import Component, { IComponentOptions } from '../share/Component'
import MarkdownIt from 'markdown-it'

interface IOptions extends IComponentOptions {
  markdown?: string
}

/**
 * Live markdown renderer.
 */
export default class MarkdownViewer extends Component<IOptions> {
  private md: MarkdownIt = new MarkdownIt()
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'markdown-viewer' }, options)

    this.initOptions(options, {
      markdown: '',
    })

    this.render()

    this.bindEvent()
  }
  private render() {
    this.$container.html(this.md.render(this.options.markdown))
  }
  private bindEvent() {
    this.on('optionChange', (name) => {
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
