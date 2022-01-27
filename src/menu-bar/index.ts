import Component from '../share/Component'
// @ts-ignore
import LunaMenu from 'luna-menu'
import h from 'licia/h'
import each from 'licia/each'
import idxOf from 'licia/idxOf'
import toStr from 'licia/toStr'
import $ from 'licia/$'
import toNum from 'licia/toNum'

interface IMenuItemOptions {
  label: string
  submenu?: LunaMenu
}

export default class MenuBar extends Component {
  private menuItems: IMenuItemOptions[] = []
  private $list: $.$
  private list: HTMLElement
  constructor(container: HTMLElement) {
    super(container, { compName: 'menu-bar' })

    this.initTpl()
    this.$list = this.find('.menu-list')
    this.list = this.$list.get(0) as HTMLElement

    this.bindEvent()
  }
  static build(container: HTMLElement, template: any[]) {
    const menuBar = new MenuBar(container)

    each(template, (item) => {
      menuBar.append({
        label: item.label,
        submenu: LunaMenu.build(item.submenu),
      })
    })

    return menuBar
  }
  append(options: IMenuItemOptions) {
    this.insert(this.menuItems.length, options)
  }
  insert(pos: number, options: IMenuItemOptions) {
    const { list, c, menuItems } = this

    menuItems.splice(pos, 0, options)
    const el = h(
      'span',
      {
        class: c('menu-item'),
        ['data-idx']: toStr(idxOf(menuItems, options)),
      },
      options.label
    )
    list.insertBefore(el, list.children[pos])
  }
  private initTpl() {
    this.$container.html(this.c('<div class="menu-list"></div>'))
  }
  private bindEvent() {
    const { c, menuItems } = this

    this.$list.on('click', c('.menu-item'), function (this: any) {
      const $item = $(this)
      const offset = $item.offset()
      const idx = toNum($item.data('idx'))
      const menuItem = menuItems[idx]
      menuItem.submenu.show(offset.left, offset.top + offset.height)
    })
  }
}

module.exports = MenuBar
module.exports.default = MenuBar
