import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

export = class Editor extends Component {
  private $toolbar: $.$
  private $content: $.$
  private content: HTMLElement
  constructor(container: Element) {
    super(container, { compName: 'editor' })

    const html = this.$container.html()

    this.appendTpl()

    this.$toolbar = this.find('.toolbar')
    this.$content = this.find('.content')
    this.content = this.$content.get(0) as HTMLElement

    this.$content.html(html)

    this.bindEvent()
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
  private exec(command: string, val?: string) {
    document.execCommand(command, false, val)
    this.content.focus()
  }
  private appendTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="toolbar">
        <button class="button header">
          <span class="icon icon-header"></span>
        </button>
        <button class="button bold">
          <span class="icon icon-bold"></span>
        </button>
        <button class="button italic">
          <span class="icon icon-italic"></span>
        </button>
        <button class="button underline">
          <span class="icon icon-underline"></span>
        </button>
        <button class="button strike-through">
          <span class="icon icon-strike-through"></span>
        </button>
        <button class="button quote">
          <span class="icon icon-quote"></span>
        </button>
        <button class="button horizontal-rule">
          <span class="icon icon-horizontal-rule"></span>
        </button>
      </div>  
      <div class="body">
        <div class="content" contenteditable></div>
      </div>
    `)
    )
  }
}
