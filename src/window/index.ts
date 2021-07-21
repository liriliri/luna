import Component from '../share/Component'
import h from 'licia/h'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

interface IOptions {
  width?: number
  height?: number
  title: string
}

export default class Window extends Component {
  private $title: $.$
  private options: Required<IOptions>
  constructor({ width = 800, height = 600, title }: IOptions) {
    super(h('div'), { compName: 'window' })

    this.options = {
      width,
      height,
      title,
    }

    this.initTpl()

    this.$title = this.find('.title')

    this.render()
  }
  show() {
    const $desktop = this.createDesktop()
    $desktop.append(this.container)
  }
  moveTo(x: number, y: number) {
    this.$container.css({
      left: x,
      top: y,
    })
  }
  private createDesktop() {
    let $desktop = $(this.c('.desktop'))
    if (($desktop as any).length > 0) {
      return $desktop
    }

    const desktop = h(this.c('.desktop'))
    $desktop = $(desktop)
    document.body.appendChild(desktop)
    return $desktop
  }
  private render() {
    const { options } = this

    this.$container.css({
      width: options.width,
      height: options.height,
    })

    this.$title.text(options.title)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="title-bar">
        <div class="title-bar-left">
          <div class="title"></div>
        </div>
      </div>
      <div class="body"></div>
      `)
    )
  }
}

module.exports = Window
module.exports.default = Window
