import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import Toolbar from './Toolbar'
import Selection from './Selection'
import isArr from 'licia/isArr'
import h from 'licia/h'
import concat from 'licia/concat'

interface IOptions extends IComponentOptions {
  toolbar?: string[] | Toolbar
}

/**
 * Wysiwyg editor.
 *
 * @example
 * const container = document.getElementById('container')
 * const editor = new LunaEditor(container)
 * console.log(editor.html())
 */
export default class Editor extends Component<IOptions> {
  selection: Selection
  toolbar: Toolbar
  private $content: $.$
  private content: HTMLElement
  static Toolbar = Toolbar
  constructor(container: Element, options: IOptions = {}) {
    super(container, { compName: 'editor' })

    this.initOptions(options, {
      toolbar: concat(Toolbar.defaultActions, ['fullscreen']),
    })

    const html = this.$container.html()

    this.initTpl()

    this.$content = this.find('.content')
    this.content = this.$content.get(0) as HTMLElement

    this.selection = new Selection()

    const toolbar = this.options.toolbar
    if (isArr(toolbar)) {
      const toolbarContainer = h('div')
      this.container.prepend(toolbarContainer)
      this.toolbar = new Toolbar(toolbarContainer, {
        actions: toolbar as string[],
      })
    } else {
      this.toolbar = toolbar as Toolbar
    }
    this.toolbar.init(this)

    this.$content.html(html)

    this.bindEvent()
  }
  html() {
    return this.$content.html()
  }
  exec(command: string, val?: string) {
    document.execCommand(command, false, val)
    this.focus()
  }
  focus() {
    this.content.focus()
  }
  destroy() {
    this.toolbar.destroy()
    super.destroy()
  }
  private bindEvent() {
    this.$content
      .on('keyup', this.onContentKeyUp)
      .on('mouseup', this.onContentMouseUp)
  }
  private onContentKeyUp = () => {
    this.toolbar.update()
  }
  private onContentMouseUp = () => {
    this.toolbar.update()
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <div class="content" contenteditable></div>
      </div>
    `)
    )
  }
}

module.exports = Editor
module.exports.default = Editor
