import Editor from './index'
import Component from '../share/Component'
import each from 'licia/each'

class Action {
  protected editor: Editor
  constructor(editor: Editor) {
    this.editor = editor
  }
}

interface IAction {
  onClick(): void
}

class Bold extends Action implements IAction {
  onClick() {}
}

const actionMap: any = {
  bold: Bold,
}

interface IOptions {
  actions: string[]
}

export default class Toolbar extends Component {
  private actionNames: string[]
  private actions: Array<Action & IAction> = []
  static defaultActions = ['bold']
  constructor(container: Element, { actions }: IOptions) {
    super(container, { compName: 'editor-toolbar' })
    this.actionNames = actions
  }
  init(editor: Editor) {
    each(this.actionNames, (actionName) => {
      if (actionMap[actionName]) {
        this.actions.push(new actionMap[actionName](editor))
      }
    })
  }
}
