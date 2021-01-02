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
    this.$toolbar.on('click', c('.bold'), this.onBoldClick)
  }
  private onBoldClick = () => {
    document.execCommand('bold')
    this.content.focus()
  }
  private appendTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="toolbar">
        <button class="button bold">
          <span class="icon icon-bold"></span>
        </button>
        <button class="button italic">
          <span class="icon icon-italic"></span>
        </button>
        <button class="button underline">
          <span class="icon icon-underline"></span>
        </button>
        <button class="button line-through">
          <span class="icon icon-line-through"></span>
        </button>
      </div>  
      <div class="body">
        <div class="content" contenteditable></div>
      </div>
    `)
    )
  }
}
