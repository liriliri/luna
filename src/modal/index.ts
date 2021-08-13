import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

interface IOptions {
  title?: string
  content: string | HTMLElement
}

class Modal extends Component<IOptions> {
  private $title: $.$
  private $body: $.$
  private $content: $.$
  constructor(container: HTMLElement, { title = '', content = '' } = {}) {
    super(container, { compName: 'modal' })
    this.hide()

    this.options = {
      title,
      content,
    }

    this.initTpl()
    this.$title = this.find('.title')
    this.$content = this.find('.content')
    this.$body = this.find('.body')

    this.bindEvent()
  }
  show() {
    this.render()
    this.$container.rmClass(this.c('hidden'))
  }
  hide = () => {
    this.$container.addClass(this.c('hidden'))
    this.on('optionChange', this.render)
  }
  destroy() {
    super.destroy()
    this.$container.rmClass(this.c('hidden'))
  }
  private bindEvent() {
    this.$body.on('click', this.c('.icon-close'), this.hide)
  }
  private render = () => {
    const { options } = this
    this.$title.text(options.title)
    this.$content.html('').append(options.content)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <span class="icon icon-close"></span>
        <div class="title"></div>
        <div class="content"></div>
      </div>
      `)
    )
  }
}

module.exports = Modal
module.exports.default = Modal
