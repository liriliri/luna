import Component from '../share/Component'
import $ from 'licia/$'
import h from 'licia/h'
import defaults from 'licia/defaults'
import each from 'licia/each'
import { measuredScrollbarWidth, hasVerticalScrollbar } from '../share/util'

/**
 * Simple menu.
 *
 * @example
 * const menu = new LunaMenu()
 * menu.append({
 *   type: 'normal',
 *   label: 'New File',
 *   click() {
 *     console.log('New File clicked')
 *   }
 * })
 * menu.show(0, 0)
 */
export default class Menu extends Component {
  private menuItems: IMenuItemOptions[] = []
  private subMenu?: Menu
  private highlighted: $.$ | null = null
  constructor() {
    super(h('div'), { compName: 'menu' })

    this.bindEvent()
  }
  /**
   * Create menu from template.
   * @static
   */
  static build(template: any[]) {
    const menu = new Menu()
    each(template, (item) => {
      if (item.type === 'submenu') {
        item.submenu = Menu.build(item.submenu)
      }
      menu.append(item)
    })
    return menu
  }
  /** Append menu item. */
  append(options: IMenuItemOptions) {
    this.insert(this.menuItems.length, options)
  }
  /** Inert menu item to given position. */
  insert(pos: number, options: IMenuItemOptions) {
    defaults(options, {
      type: 'normal',
    })
    this.menuItems.splice(pos, 0, options)
  }
  /** Show menu at target position. */
  show(x: number, y: number, parent?: Menu) {
    if (parent) {
      this.hide()
    } else {
      this.hideAll()
    }
    const { $container, menuItems } = this
    $container.html('')

    for (let i = 0, len = menuItems.length; i < len; i++) {
      this.$container.append(this.createMenuItem(menuItems[i]))
    }

    const $glassPane = this.createGlassPane()
    $glassPane.append(this.container)

    this.positionContent(x, y, parent)
  }
  destroy() {
    this.hide()
    super.destroy()
  }
  hide = () => {
    this.$container.remove()
    this.hideSubMenu()
    if (($('.luna-menu') as any).length === 0) {
      this.hideAll()
    }
  }
  hideAll = () => {
    $(this.c('.glass-pane')).html('').remove()
  }
  private positionContent(x: number, y: number, parent?: Menu) {
    const { $container } = this
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight
    const scrollbarSize = measuredScrollbarWidth()

    let width = winWidth
    let height = winHeight
    let parentWidth = 0
    if (parent) {
      parentWidth = parent.$container.offset().width
    }

    const offset = $container.offset()
    const widthOverflow = height < offset.height ? scrollbarSize : 0
    const heightOverflow = width < offset.width ? scrollbarSize : 0
    width = Math.min(width, offset.width + widthOverflow)
    height = Math.min(height, offset.height + heightOverflow)

    let left = x
    let top = y
    const right = winWidth - x
    const bottom = winHeight - y
    if (right < width && x - parentWidth > right) {
      left = x - width - parentWidth
    }
    if (bottom < height) {
      if (y > height) {
        top = y - height
        if (parent) {
          top += 30
        }
      } else {
        top -= height - bottom
      }
    }

    $container.css({
      width,
      height,
      left,
      top,
    })
  }
  private showSubMenu(subMenu: Menu, $el: $.$) {
    const { left, width, top } = $el.offset()

    let x = left + width
    if (hasVerticalScrollbar(this.container)) {
      x += measuredScrollbarWidth()
    }
    subMenu.show(x, top - 5, this)
    this.subMenu = subMenu
  }
  private hideSubMenu() {
    if (this.subMenu) {
      this.subMenu.hide()
      delete this.subMenu
    }
  }
  private createGlassPane() {
    let $glassPane = $(this.c('.glass-pane'))
    if (($glassPane as any).length > 0) {
      return $glassPane
    }

    const glassPane = h(this.c('.glass-pane'))
    $glassPane = $(glassPane)
    document.body.appendChild(glassPane)
    $glassPane.on('click', this.hideAll)
    $glassPane.on('contextmenu', (e) => e.preventDefault())
    return $glassPane
  }
  private createMenuItem(item: IMenuItemOptions) {
    const { c } = this
    if (item.type === 'separator') {
      return h(c('.separator'))
    }

    const el = h(c('.item'))
    const $el = $(el)

    $el.text(item.label as string)
    $el.append(
      `<span class="${c('icon icon-arrow-right')}${
        item.type === 'submenu' ? '' : ' ' + c('invisible')
      }"></span>`
    )
    $el.on('mouseover', () => {
      this.highlight($el)
      if (item.submenu) {
        if (item.submenu !== this.subMenu) {
          this.hideSubMenu()
        }
        this.showSubMenu(item.submenu, $el)
      } else {
        this.hideSubMenu()
      }
    })
    $el.on('mouseleave', () => {
      if (!this.subMenu || this.subMenu !== item.submenu) {
        this.highlight(null)
      }
    })
    $el.on('click', () => {
      if (item.click) {
        item.click()
      }
      if (item.type === 'normal') {
        this.hideAll()
      }
    })

    return el
  }
  private highlight($el: $.$ | null) {
    if (this.highlighted === $el) {
      return
    }

    if ($el) {
      $el.addClass(this.c('active'))
    }
    if (this.highlighted) {
      this.highlighted.rmClass(this.c('active'))
    }
    this.highlighted = $el
  }
  private bindEvent() {
    this.$container.on('click', (e) => e.stopPropagation())
  }
}

module.exports = Menu
module.exports.default = Menu

/** IMenuItemOptions */
export interface IMenuItemOptions {
  /** Menu type. */
  type?: 'normal' | 'separator' | 'submenu'
  /** Menu label. */
  label?: string
  /** Sub menu. */
  submenu?: Menu
  /** Click event handler. */
  click?: () => void
}
