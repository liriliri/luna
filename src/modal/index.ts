import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import h from 'licia/h'
import types from 'licia/types'
import map from 'licia/map'

interface IOptions {
  title?: string
  content?: string | HTMLElement
  footer?: string | HTMLElement
  showClose?: boolean
}

class Modal extends Component<IOptions> {
  private $title: $.$
  private $body: $.$
  private $content: $.$
  private $close: $.$
  private $footer: $.$
  constructor(
    container: HTMLElement,
    { title = '', content = '', footer = '', showClose = true }: IOptions = {}
  ) {
    super(container, { compName: 'modal' })
    this.hide()

    this.options = {
      title,
      content,
      footer,
      showClose,
    }

    this.initTpl()
    this.$title = this.find('.title')
    this.$content = this.find('.content')
    this.$body = this.find('.body')
    this.$footer = this.find('.footer')
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
    modal.setOption({
      title: '',
      content: msg,
      footer: createButtons(
        {
          OK: {
            type: 'primary',
            onclick() {
              modal.hide()
            },
          },
        },
        c
      ),
    })
    modal.show()
  }
  static confirm(msg: string) {
    return new Promise((resolve) => {
      const modal = getGlobalModal()
      const { c } = modal
      modal.setOption({
        title: '',
        content: msg,
        footer: createButtons(
          {
            Cancel: {
              type: 'secondary',
              onclick() {
                modal.hide()
                resolve(false)
              },
            },
            Ok: {
              type: 'primary',
              onclick() {
                modal.hide()
                resolve(true)
              },
            },
          },
          c
        ),
      })
      modal.show()
    })
  }
  static prompt(title = '', defaultText = '') {
    return new Promise((resolve) => {
      const modal = getGlobalModal()
      const { c } = modal
      const input = h('input' + c('.input'), {
        value: defaultText,
      }) as HTMLInputElement
      modal.setOption({
        title,
        content: input,
        footer: createButtons(
          {
            Cancel: {
              type: 'secondary',
              onclick() {
                modal.hide()
                resolve(null)
              },
            },
            Ok: {
              type: 'primary',
              onclick() {
                modal.hide()
                resolve(input.value)
              },
            },
          },
          c
        ),
      })
      modal.show()
    })
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
    if (!options.footer) {
      $body.addClass(c('no-footer'))
    } else {
      $body.rmClass(c('no-footer'))
      this.$footer.html('').append(options.footer)
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
        <div class="footer"></div>
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
      showClose: false,
    })
  }

  return globalModal
}

interface IButton {
  type: string
  onclick: types.AnyFn
}

function createButtons(buttons: types.PlainObj<IButton>, c: types.AnyFn) {
  const buttonEls = map(buttons, (button, key) => {
    return h(
      c('.button') + c('.' + button.type),
      {
        onclick: button.onclick,
      },
      key
    )
  })

  return h(c('.button-group'), {}, ...buttonEls)
}

module.exports = Modal
module.exports.default = Modal
