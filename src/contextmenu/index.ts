import './style.scss'
import $ from 'licia/$'

module.exports = class Contextmenu {
  private $container: $.$
  private menuItems: MenuItem[] = []
  constructor(container: Element) {
    this.$container = $(container)
  }
  append(options: IMenuItemOptions) {
    this.menuItems.push(new MenuItem(options))
  }
  popup(x: number, y: number) {
    this.popupMenuItems(this.menuItems, x, y)
  }
  private popupMenuItems(menuItems: MenuItem[], x: number, y: number) {}
}

interface IMenuItemOptions {
  label: string
}

class MenuItem {
  constructor(options: IMenuItemOptions) {}
}
