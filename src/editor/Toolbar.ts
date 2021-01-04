import Editor from './index'
import Component from '../share/Component'
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
    this.update()
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
}

interface IOptions {
  actions: string[]
}

export default class Toolbar extends Component {
  private actionNames: string[]
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
  constructor(container: Element, { actions }: IOptions) {
    super(container, { compName: 'editor-toolbar' })
    this.actionNames = actions
  }
  init(editor: Editor) {
    each(this.actionNames, (actionName) => {
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
  update() {
    each(this.actions, (action) => action.update())
  }
}
