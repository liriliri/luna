import Component from '../share/Component'
import h from 'licia/h'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

interface IOptions {
  width?: number
  height?: number
  x?: number
  y?: number
  title: string
}

export default class Window extends Component<Required<IOptions>> {
  private $title: $.$
  private $titleBar: $.$
  constructor({ width = 800, height = 600, x = 0, y = 0, title }: IOptions) {
    super(h('div'), { compName: 'window' })

    this.options = {
      width,
      height,
      title,
      x,
      y,
    }

    this.initTpl()

    this.$title = this.find('.title')
    this.$titleBar = this.find('.title-bar')

    this.render()

    const $desktop = this.createDesktop()
    $desktop.append(this.container)

    this.bindEvent()
  }
  show() {
    this.$container.show()
  }
  minimize = () => {
    this.$container.hide()
  }
  destroy = () => {
    this.$container.remove()
    super.destroy()
  }
  private moveTo(x: number, y: number) {
    this.$container.css({
      left: x,
      top: y,
    })
  }
  private resizeTo(width: number, height: number) {
    if (width < 200) {
      width = 200
    }
    if (height < 150) {
      height = 150
    }

    this.$container.css({
      width,
      height,
    })
  }
  private bindEvent() {
    const { c } = this

    this.on('optionChange', () => this.render())

    this.$titleBar
      .on('click', c('.icon-close'), this.destroy)
      .on('click', c('.icon-minimize'), this.minimize)
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

    this.$title.text(options.title)

    this.resizeTo(options.width, options.height)
    this.moveTo(options.x, options.y)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="title-bar">
        <div class="title-bar-left">
          <div class="title"></div>
        </div>
        <div class="title-bar-center"></div>
        <div class="title-bar-right">
          <span class="icon icon-minimize"></span>
          <span class="icon icon-maximize"></span>
          <span class="icon icon-close"></span>
        </div>
      </div>
      <div class="body"></div>
      `)
    )
  }
}

module.exports = Window
module.exports.default = Window
