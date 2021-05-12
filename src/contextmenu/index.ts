import Component from '../share/Component'

export default class Contextmenu extends Component {
  private menuItems: MenuItem[] = []
  constructor(container: HTMLElement) {
    super(container, { compName: 'contextmenu' })
  }
  append(options: IMenuItemOptions) {
    this.menuItems.push(new MenuItem(options))
  }
  popup(x: number, y: number) {
    this.popupMenuItems(this.menuItems, x, y)
  }
  private popupMenuItems(menuItems: MenuItem[], x: number, y: number) {}
}

module.exports = Contextmenu
module.exports.default = Contextmenu

interface IMenuItemOptions {
  label: string
}

class MenuItem {
  constructor(options: IMenuItemOptions) {}
}
