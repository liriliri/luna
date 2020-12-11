import './style.scss'

export = class Contextmenu {
  private menuItems: MenuItem[] = []
  constructor(container: Element) {
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
