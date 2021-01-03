import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import Toolbar from './toolbar'
import Selection from './Selection'
import isArr from 'licia/isArr'
import h from 'licia/h'

interface IOptions {
  toolbar?: string[] | Toolbar
}

export = class Editor extends Component {
  public selection: Selection
  private $toolbar: $.$
  private $content: $.$
  private content: HTMLElement
  private toolbar: Toolbar
  static Toolbar = Toolbar
  constructor(container: Element, { toolbar = Toolbar.defaultActions } : IOptions = {}) {
    super(container, { compName: 'editor' })

    const html = this.$container.html()

    this.appendTpl()

    this.$toolbar = this.find('.toolbar')
    this.$content = this.find('.content')
    this.content = this.$content.get(0) as HTMLElement

    this.selection = new Selection()

    if (isArr(toolbar)) {
      const toolbarContainer = h('div')
      this.container.prepend(toolbarContainer)
      this.toolbar = new Toolbar(toolbarContainer, {actions: toolbar as string[]})
    } else {
      this.toolbar = toolbar as Toolbar
    }
    this.toolbar.init(this) 

    this.$content.html(html)

    this.bindEvent()
  }
  exec(command: string, val?: string) {
    document.execCommand(command, false, val)
    this.focus()
  }
  focus() {
    this.content.focus()
  }
  private bindEvent() {
    const { c } = this
    this.$toolbar
      .on('click', c('.bold'), this.onBoldClick)
      .on('click', c('.italic'), this.onItalicClick)
      .on('click', c('.underline'), this.onUnderlineClick)
      .on('click', c('.strike-through'), this.onStrikeThroughClick)
      .on('click', c('.quote'), this.onQuoteClick)
      .on('click', c('.header'), this.onHeaderClick)
      .on('click', c('.horizontal-rule'), this.onHorizontalRuleClick)
  }
  private onBoldClick = () => this.exec('bold')
  private onItalicClick = () => this.exec('italic')
  private onUnderlineClick = () => this.exec('underline')
  private onStrikeThroughClick = () => this.exec('strikeThrough')
  private onQuoteClick = () => this.exec('formatBlock', '<blockquote>')
  private onHeaderClick = () => this.exec('formatBlock', '<h1>')
  private onHorizontalRuleClick = () => this.exec('insertHorizontalRule')
  private appendTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="toolbar">
        <button class="button header">
          <span class="icon icon-header"></span>
        </button>
      </div>  
      <div class="body">
        <div class="content" contenteditable></div>
      </div>
    `)
    )
  }
}
