import Component from '../share/Component'
import h from 'licia/h'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

export default class Window extends Component {
  constructor() {
    super(h('div'), { compName: 'window' })

    this.initTpl()
  }
  show() {
    const $desktop = this.createDesktop()
    $desktop.append(this.container)
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
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="title-bar"></div>
      <div class="body"></div>
      `)
    )
  }
}

module.exports = Window
module.exports.default = Window
