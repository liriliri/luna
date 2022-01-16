import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import isEmpty from 'licia/isEmpty'
import trim from 'licia/trim'
import fuzzySearch from 'licia/fuzzySearch'
import each from 'licia/each'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import hotKey from 'licia/hotkey'
import lowerCase from 'licia/lowerCase'
import types from 'licia/types'
import keyCode from 'licia/keyCode'

interface ICommand {
  title: string
  shortcut?: string
  handler: types.AnyFn
}

interface IOptions {
  placeholder?: string
  shortcut?: string
  commands?: ICommand[]
}

const MAX_WIDTH = 500

class CommandPalette extends Component<IOptions> {
  private $input: $.$
  private input: HTMLInputElement
  private $list: $.$
  private $body: $.$
  private activeIdx = 0
  private keyword = ''
  private curCommands: ICommand[] = []
  constructor(
    container: HTMLElement,
    {
      placeholder = 'Type a command',
      commands = [],
      shortcut = 'Ctrl+P',
    }: IOptions = {}
  ) {
    super(container, { compName: 'command-palette' })
    this.hide()

    this.options = {
      placeholder,
      commands,
      shortcut,
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
  show = (e: any) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    this.calcWidth()
    window.addEventListener('resize', this.calcWidth)

    this.render()
    this.$container.rmClass(this.c('hidden'))

    this.input.focus()
  }
  destroy() {
    const { shortcut, commands } = this.options
    this.hide()
    if (shortcut) {
      hotKey.off(lowerCase(shortcut), this.show)
    }
    each(commands, (command) => {
      const { shortcut, handler } = command
      if (shortcut) {
        hotKey.off(lowerCase(shortcut), handler)
      }
    })
    this.$container.off('click', this.hide)
    super.destroy()
  }
  private bindEvent() {
    const { shortcut, commands } = this.options

    this.$input.on('input', this.onInput).on('keydown', this.onKeydown)
    this.$body.on('click', (e) => e.stopPropagation())
    this.$container.on('click', this.hide)
    const self = this
    this.$list.on('click', 'li', function (this: any) {
      const $this = $(this)
      const idx = toNum($this.data('idx'))
      const command = self.curCommands[idx]
      command.handler()
      self.hide()
    })

    if (shortcut) {
      hotKey.on(lowerCase(shortcut), this.show)
    }

    each(commands, (command) => {
      const { shortcut, handler } = command
      if (shortcut) {
        hotKey.on(lowerCase(shortcut), handler)
      }
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
  private onKeydown = (e: any) => {
    e = e.origEvent
    let { activeIdx } = this
    const { curCommands } = this

    switch ((e as KeyboardEvent).keyCode) {
      case keyCode('down'):
        if (activeIdx > -1) {
          activeIdx++
          if (activeIdx >= curCommands.length) {
            activeIdx = 0
          }
          this.setActive(activeIdx)
        }
        break
      case keyCode('up'):
        if (activeIdx > -1) {
          activeIdx--
          if (activeIdx < 0) {
            activeIdx = curCommands.length - 1
          }
          this.setActive(activeIdx)
        }
        break
      case keyCode('enter'):
        if (activeIdx > -1) {
          const command = curCommands[activeIdx]
          command.handler()
          this.hide()
        }
        break
      case keyCode('esc'):
        this.hide()
        break
    }
  }
  private onInput = () => {
    const keyword = trim(this.input.value)

    if (keyword === this.keyword) {
      return
    }

    this.keyword = keyword
    this.render()
  }
  private setActive(idx: number) {
    this.activeIdx = idx
    if (idx < 0) {
      return
    }
    const { c } = this
    this.find('.active').rmClass(c('active'))
    this.$body.find(`[data-idx="${toStr(idx)}"]`).addClass(c('active'))
  }
  private render = () => {
    let { commands } = this.options
    const { c, $list, keyword } = this

    if (keyword) {
      commands = fuzzySearch(keyword, commands, {
        key: 'title',
      })
    }

    this.activeIdx = 0

    if (isEmpty(commands)) {
      $list.addClass(c('hidden'))
      this.setActive(-1)
    } else {
      let html = ''
      each(commands, (command, idx) => {
        html += this.c(stripIndent`
        <li data-idx="${toStr(idx)}">
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
      this.setActive(0)
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
