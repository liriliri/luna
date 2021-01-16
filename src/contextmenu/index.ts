import Component from '../share/Component'

export = class Contextmenu extends Component {
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

interface IMenuItemOptions {
  label: string
}

class MenuItem {
  constructor(options: IMenuItemOptions) {}
}
