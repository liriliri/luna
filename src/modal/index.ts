import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import h from 'licia/h'

interface IOptions {
  title?: string
  content?: string | HTMLElement
  showClose?: boolean
}

class Modal extends Component<IOptions> {
  private $title: $.$
  private $body: $.$
  private $content: $.$
  private $close: $.$
  constructor(
    container: HTMLElement,
    { title = '', content = '', showClose = true }: IOptions = {}
  ) {
    super(container, { compName: 'modal' })
    this.hide()

    this.options = {
      title,
      content,
      showClose,
    }

    this.initTpl()
    this.$title = this.find('.title')
    this.$content = this.find('.content')
    this.$body = this.find('.body')
    this.$close = this.find('.icon-close')

    this.bindEvent()
  }
  show() {
    this.render()
    this.$container.rmClass(this.c('hidden'))
  }
  hide = () => {
    this.$container.addClass(this.c('hidden'))
  }
  destroy() {
    super.destroy()
    this.$container.rmClass(this.c('hidden'))
  }
  static alert(msg: string) {
    const modal = getGlobalModal()
    const { c } = modal
    modal.setOption(
      'content',
      h(
        'div',
        {},
        h(c('.text'), {}, msg),
        h(c('.button-group'), {}, h(c('.button.primary'), {}, 'OK'))
      )
    )
    modal.show()
  }
  private bindEvent() {
    this.$body.on('click', this.c('.icon-close'), this.hide)
    this.on('optionChange', this.render)
  }
  private render = () => {
    const { options, c, $body } = this
    if (!options.title) {
      $body.addClass(c('no-title'))
    } else {
      $body.rmClass(c('no-title'))
      this.$title.text(options.title)
    }
    if (!options.showClose) {
      this.$close.hide()
    } else {
      this.$close.show()
    }
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

let globalModal: Modal | null = null

function getGlobalModal() {
  if (!globalModal) {
    const container = h('div')
    document.body.append(container)
    globalModal = new Modal(container, {
      title: location.host + ' Says',
      showClose: false,
    })
  }

  return globalModal
}

module.exports = Modal
module.exports.default = Modal
