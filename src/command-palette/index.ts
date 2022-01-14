import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import isEmpty from 'licia/isEmpty'
import trim from 'licia/trim'
import fuzzySearch from 'licia/fuzzySearch'
import each from 'licia/each'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'

interface ICommand {
  title: string
  shortcut?: string
  handler: () => void
}

interface IOptions {
  placeholder?: string
  commands?: ICommand[]
}

const MAX_WIDTH = 500

class CommandPalette extends Component<IOptions> {
  private $input: $.$
  private input: HTMLInputElement
  private $list: $.$
  private $body: $.$
  private activeIdx = 0
  private curCommands: ICommand[] = []
  constructor(
    container: HTMLElement,
    { placeholder = 'Type a command', commands = [] }: IOptions = {}
  ) {
    super(container, { compName: 'command-palette' })
    this.hide()

    this.options = {
      placeholder,
      commands,
    }

    this.initTpl()
    this.$body = this.find('.body')
    this.$input = this.find('.input')
    this.input = this.$input.get(0) as HTMLInputElement
    this.$list = this.find('.list')

    this.bindEvent()
  }
  hide = () => {
    window.removeEventListener('resize', this.calcWidth)
    this.$container.addClass(this.c('hidden'))
  }
  show() {
    this.input.focus()

    this.calcWidth()
    window.addEventListener('resize', this.calcWidth)

    this.render()
    this.$container.rmClass(this.c('hidden'))
  }
  destroy() {
    this.hide()
    this.$container.off('click', this.hide)
    super.destroy()
  }
  private bindEvent() {
    this.$input.on('input', this.render)
    this.$body.on('click', (e) => e.stopPropagation())
    this.$container.on('click', this.hide)
    const self = this
    this.$list.on('click', 'li', function (this: any) {
      const $this = $(this)
      const idx = toNum($this.data('idx'))
      const command = self.curCommands[idx]
      command.handler()
    })
  }
  private calcWidth = () => {
    let width = window.innerWidth
    if (width > MAX_WIDTH) {
      width = MAX_WIDTH
    }
    this.$body.css({
      width: width,
    })
  }
  private render = () => {
    let { commands } = this.options
    const { c, $list } = this

    const keyword = trim(this.input.value)

    if (keyword) {
      commands = fuzzySearch(keyword, commands, {
        key: 'title',
      })
    }

    this.activeIdx = 0

    if (isEmpty(commands)) {
      $list.addClass(c('hidden'))
    } else {
      let html = ''
      each(commands, (command, idx) => {
        html += this.c(stripIndent`
        <li${idx === this.activeIdx ? ' class="active"' : ''} data-idx="${toStr(
          idx
        )}">
          <span class="title">${command.title}</span>
          ${
            command.shortcut
              ? `<span class="shortcut">${command.shortcut}</span>`
              : ''
          }
        </li>
        `)
      })
      $list.html(html).rmClass(c('hidden'))
    }

    this.curCommands = commands
  }
  private initTpl() {
    const { options } = this

    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <input class="input" type="text" placeholder="${options.placeholder}"></input>
        <ul class="list hidden"></ul>
      </div>
      `)
    )
  }
}

module.exports = CommandPalette
module.exports.default = CommandPalette
