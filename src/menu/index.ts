import Component from '../share/Component'
import $ from 'licia/$'
import h from 'licia/h'

export default class Menu extends Component {
  private menuItems: IMenuItemOptions[] = []
  constructor() {
    super(h('div'), { compName: 'menu' })
  }
  append(options: IMenuItemOptions) {
    this.menuItems.push(options)
  }
  show(x: number, y: number) {
    const { $container, menuItems } = this
    $container
      .css({
        left: x,
        top: y,
      })
      .html('')

    for (let i = 0, len = menuItems.length; i < len; i++) {
      this.$container.append(this.createMenuItem(menuItems[i]))
    }

    const $glassPane = this.createGlassPane()
    $glassPane.append(this.container)
  }
  private createGlassPane() {
    const $grassPane = $(this.c('.grass-pane'))
    if (($grassPane as any).length > 0) {
      return $grassPane
    }

    const glassPane = h(this.c('.grass-pane'))
    const $glassPane = $(glassPane)
    document.body.appendChild(glassPane)
    $glassPane.on('click', () => {
      $glassPane.html('').remove()
    })
    return $glassPane
  }
  private createMenuItem(item: IMenuItemOptions) {
    if (item.type === 'separator') {
      return this.createSeparator()
    }

    const el = h('div')
    const $el = $(el)

    $el.text(item.label as string)

    return el
  }
  private createSeparator() {
    const el = h('div')
    return el
  }
}

module.exports = Menu
module.exports.default = Menu

interface IMenuItemOptions {
  type?: 'normal' | 'separator' | 'submenu'
  label?: string
  submenu?: Menu
  click?: () => void
}
