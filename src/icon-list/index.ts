import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import throttle from 'licia/throttle'
import h from 'licia/h'
import $ from 'licia/$'
import types from 'licia/types'
import isFn from 'licia/isFn'
import isRegExp from 'licia/isRegExp'
import trim from 'licia/trim'
import isStr from 'licia/isStr'
import contain from 'licia/contain'
import isNull from 'licia/isNull'
import each from 'licia/each'
import lowerCase from 'licia/lowerCase'
import ResizeSensor from 'licia/ResizeSensor'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Icon size. */
  size?: number
  /** Icon filter. */
  filter?: string | RegExp | types.AnyFn
  /** Whether icon is selectable.  */
  selectable?: boolean
}

/** IIcon */
export interface IIcon {
  src: string
  name: string
  style?: types.PlainObj<any>
}

const GAP = 20
const MIN_APPEND_INTERVAL = 100

/**
 * Show list of icons and their names.
 *
 * @example
 * const iconList = new LunaIconList(container)
 * iconList.setIcons([
 *   {
 *     src: '/logo.png',
 *     name: 'Luna',
 *   },
 * ])
 */
export default class IconList extends Component<IOptions> {
  private resizeSensor: ResizeSensor
  private icons: Icon[] = []
  private displayIcons: Icon[] = []
  private frag: DocumentFragment = document.createDocumentFragment()
  private appendTimer: NodeJS.Timeout | null = null
  private onResize: () => void
  private selectedIcon: Icon | null = null
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'icon-list' }, options)

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      this.updateColumnCount()
    }, 16)

    this.initOptions(options, {
      size: 48,
      selectable: true,
    })

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  setIcons(icons: Array<IIcon>) {
    this.clear()
    each(icons, (data) => {
      const icon = new Icon(this, data)
      icon.setSize(this.options.size)
      this.icons.push(icon)
      if (this.filterIcon(icon)) {
        this.displayIcons.push(icon)
      }
    })
    this.render()
  }
  /** Clear all icons. */
  clear() {
    this.$container.html('')
    this.icons = []
    this.displayIcons = []
    this.selectIcon(null)

    this.updateColumnCount()
  }
  /** Append icon. */
  append(data: IIcon) {
    const icon = new Icon(this, data)
    icon.setSize(this.options.size)
    this.icons.push(icon)

    const isVisible = this.filterIcon(icon)
    if (isVisible) {
      this.displayIcons.push(icon)
    }

    this.frag.appendChild(icon.container)
    if (!this.appendTimer) {
      this.appendTimer = setTimeout(this._append, MIN_APPEND_INTERVAL)
    }
  }
  private _append = () => {
    this.container.appendChild(this.frag)
    this.appendTimer = null
    this.updateColumnCount()
  }
  private selectIcon(icon: Icon | null) {
    if (!this.options.selectable) {
      return
    }

    if (this.selectedIcon === icon) {
      return
    }

    if (this.selectedIcon) {
      this.selectedIcon.deselect()
      this.selectedIcon = null
      if (isNull(icon)) {
        this.emit('deselect')
      }
    }
    if (!isNull(icon)) {
      this.selectedIcon = icon
      icon.select()
      this.emit('select', icon)
    }
  }
  private filterIcon(icon: Icon) {
    let { filter } = this.options
    if (filter) {
      if (isFn(filter)) {
        return (filter as types.AnyFn)(icon)
      } else if (isRegExp(filter)) {
        return (filter as RegExp).test(icon.data.name)
      } else if (isStr(filter)) {
        filter = trim(filter as string)
        if (filter) {
          return contain(lowerCase(icon.data.name), lowerCase(filter))
        }
      }
    }

    return true
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)

    const self = this
    const itemClass = this.c('.icon, .name')

    this.$container
      .on('click', itemClass, function (this: any, e: any) {
        e.stopPropagation()
        const item = this.parentNode
        const icon = item.icon
        self.selectIcon(icon)
        setTimeout(() => {
          if (item.hasDoubleClick) {
            return
          }
          self.emit('click', e.origEvent, icon)
        }, 200)
      })
      .on('dblclick', itemClass, function (this: any, e: any) {
        e.stopPropagation()
        const item = this.parentNode
        const icon = item.icon
        item.hasDoubleClick = true
        self.emit('dblclick', e.origEvent, icon)
        setTimeout(() => {
          item.hasDoubleClick = false
        }, 300)
      })
      .on('click', () => this.selectIcon(null))
      .on('contextmenu', itemClass, function (this: any, e: any) {
        e.preventDefault()
        e.stopPropagation()
        const icon = this.parentNode.icon
        self.selectIcon(icon)
        self.emit('contextmenu', e.origEvent, icon)
      })

    this.on('changeOption', (name) => {
      switch (name) {
        case 'size':
          each(this.icons, (icon) => {
            icon.setSize(this.options.size)
          })
          this.updateColumnCount()
          break
        case 'filter':
          this.displayIcons = []
          each(this.icons, (icon) => {
            if (this.filterIcon(icon)) {
              this.displayIcons.push(icon)
            }
          })
          if (this.selectedIcon && !this.filterIcon(this.selectedIcon)) {
            this.selectIcon(null)
          }
          this.render()
          break
      }
    })
  }
  private updateColumnCount = () => {
    const { $container, c } = this
    const containerWidth = $container.offset().width

    const size = this.options.size + 16
    const columnCount = Math.floor(containerWidth / (size + GAP))

    if (this.icons.length > columnCount) {
      const gap = Math.floor(
        (containerWidth - columnCount * size) / columnCount
      )
      $container.addClass(c('grid'))
      $container.css({
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gap: `${GAP}px ${gap}px`,
        paddingLeft: `${gap / 2}px`,
        paddingRight: `${gap / 2}px`,
      })
    } else {
      $container.rmClass(c('grid'))
      $container.css({
        gap: '0',
        paddingLeft: `${GAP / 2}px`,
        paddingRight: `${GAP / 2}px`,
      })
    }
  }
  private render() {
    const { displayIcons, $container, container } = this

    const scrollTop = container.scrollTop

    const frag = document.createDocumentFragment()
    $container.html('')
    each(displayIcons, (icon) => {
      frag.appendChild(icon.container)
    })
    container.appendChild(frag)
    this.updateColumnCount()

    container.scrollTop = scrollTop
  }
}

export class Icon {
  container: HTMLElement = h('div')
  data: IIcon
  private $container: $.$
  private iconList: IconList
  private $icon: $.$
  constructor(iconList: IconList, data: IIcon) {
    ;(this.container as any).icon = this
    this.$container = $(this.container)
    this.$container.addClass(iconList.c('item'))

    this.iconList = iconList
    this.data = data

    this.render()
    this.$icon = this.$container.find(iconList.c('.icon'))
    this.$icon.find('img').css(data.style || {})
  }
  setSize(size: number) {
    const width = `${size + 16}px`
    this.$container.css({
      width,
    })
    this.$icon.css({
      width,
      height: width,
    })
  }
  select() {
    this.$container.addClass(this.iconList.c('selected'))
  }
  deselect() {
    this.$container.rmClass(this.iconList.c('selected'))
  }
  render() {
    const { data, $container } = this
    const { src, name } = data

    $container.append(
      this.iconList.c(`
      <div class="icon">
        <img src="${src}" draggable="false"></img>
      </div>
      <div class="name">${name}</div>
    `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, IconList)
}
