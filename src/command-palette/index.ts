import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

interface IOptions {
  placeholder?: string
}

class CommandPalette extends Component<IOptions> {
  private $input: $.$
  private input: HTMLInputElement
  constructor(
    container: HTMLElement,
    { placeholder = 'Type a command' }: IOptions = {}
  ) {
    super(container, { compName: 'command-palette' })
    this.hide()

    this.options = {
      placeholder,
    }

    this.initTpl()
    this.$input = this.find('.input')
    this.input = this.$input.get(0) as HTMLInputElement
  }
  hide() {
    this.$container.addClass(this.c('hidden'))
  }
  show() {
    this.input.focus()
    this.$container.rmClass(this.c('hidden'))
  }
  private initTpl() {
    const { options } = this

    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <input class="input" type="text" placeholder="${options.placeholder}"></input>
        <ul class="list"></ul>
      </div>
      `)
    )
  }
}

module.exports = CommandPalette
module.exports.default = CommandPalette
