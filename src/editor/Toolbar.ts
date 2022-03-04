import Editor from './index'
import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import h from 'licia/h'
import $ from 'licia/$'

class Action {
  container: HTMLElement = h('button')
  protected $container: $.$
  protected editor: Editor
  protected name: string
  constructor(editor: Editor, { name }: { name: string }) {
    this.editor = editor
    this.$container = $(this.container)
    this.name = name
    this.initTpl()
  }
  update() {
    const { $container } = this

    if (this.isActive()) {
      $container.addClass(this.editor.c('active'))
    } else {
      $container.rmClass(this.editor.c('active'))
    }
  }
  destroy() {
    this.$container.remove()
  }
  isActive() {
    return false
  }
  private initTpl() {
    const { name } = this
    const { c } = this.editor
    this.$container.attr('class', c(`button ${name}`))
    this.$container.html(c(`<span class="icon icon-${name}"></span>`))
  }
}

class CommonAction extends Action {
  private cmd: string
  private cmdVal?: string
  constructor(
    editor: Editor,
    { name, cmd, cmdVal }: { name: string; cmd?: string; cmdVal?: string }
  ) {
    super(editor, { name })
    this.cmd = cmd || name
    this.cmdVal = cmdVal

    this.bindEvent()
  }
  isActive() {
    if (this.cmd === 'formatBlock') {
      const val = document.queryCommandValue(this.cmd)
      return `<${val}>` === this.cmdVal
    }

    return document.queryCommandState(this.cmd)
  }
  private onClick = () => {
    this.editor.exec(this.cmd, this.cmdVal)
  }
  private bindEvent() {
    this.$container.on('click', this.onClick)
  }
}

class FullscreenAction extends Action {
  private normalHeight = 0
  constructor(editor: Editor) {
    super(editor, { name: 'fullscreen' })

    this.bindEvent()
  }
  destroy() {
    super.destroy()

    const { $container, c } = this.editor
    $container.rmClass(c('fullscreen'))
  }
  isActive() {
    const { $container, c } = this.editor

    return $container.hasClass(c('fullscreen'))
  }
  private enterFullscreen() {
    const { toolbar, $container, c } = this.editor
    const $body = $container.find(c('.body'))
    $container.addClass(c('fullscreen'))
    this.normalHeight = $body.offset().height

    $body.css(
      'height',
      `${window.innerHeight - toolbar.$container.offset().height}px`
    )
  }
  private exitFullScreen() {
    const { $container, c } = this.editor
    $container.rmClass(c('fullscreen'))

    const $body = $container.find(c('.body'))
    $body.css('height', this.normalHeight + 'px')
  }
  private onClick = () => {
    if (this.isActive()) {
      this.exitFullScreen()
    } else {
      this.enterFullscreen()
    }
  }
  private bindEvent() {
    this.$container.on('click', this.onClick)
  }
}

const actionClassMap: any = {
  bold: {
    Action: CommonAction,
    options: {
      name: 'bold',
    },
  },
  italic: {
    Action: CommonAction,
    options: {
      name: 'italic',
    },
  },
  underline: {
    Action: CommonAction,
    options: {
      name: 'underline',
    },
  },
  'strike-through': {
    Action: CommonAction,
    options: {
      name: 'strike-through',
      cmd: 'strikeThrough',
    },
  },
  quote: {
    Action: CommonAction,
    options: {
      name: 'quote',
      cmd: 'formatBlock',
      cmdVal: '<blockquote>',
    },
  },
  header: {
    Action: CommonAction,
    options: {
      name: 'header',
      cmd: 'formatBlock',
      cmdVal: '<h1>',
    },
  },
  'horizontal-rule': {
    Action: CommonAction,
    options: {
      name: 'horizontal-rule',
      cmd: 'insertHorizontalRule',
    },
  },
  fullscreen: FullscreenAction,
}

interface IOptions extends IComponentOptions {
  actions?: string[]
}

export default class Toolbar extends Component<IOptions> {
  private actions: Action[] = []
  static defaultActions = [
    'bold',
    'italic',
    'underline',
    'stike-through',
    'quote',
    'header',
    'horizontal-rule',
  ]
  constructor(container: Element, options: IOptions = {}) {
    super(container, { compName: 'editor-toolbar' })
    this.initOptions(options, {
      actions: Toolbar.defaultActions,
    })

    this.bindEvent()
  }
  init(editor: Editor) {
    each(this.options.actions, (actionName) => {
      const actionClass = actionClassMap[actionName]
      if (actionClass) {
        let action: Action
        if (actionClass.Action) {
          action = new actionClass.Action(editor, actionClass.options)
        } else {
          action = new actionClass(editor)
        }
        this.actions.push(action)
        this.container.appendChild(action.container)
      }
    })
  }
  update = () => {
    each(this.actions, (action) => action.update())
  }
  destroy() {
    each(this.actions, (action) => action.destroy())

    super.destroy()

    this.$container.off('click', this.update)
  }
  private bindEvent() {
    this.$container.on('click', this.update)
  }
}
