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
import each from 'licia/each'
import lowerCase from 'licia/lowerCase'
import ResizeSensor from 'licia/ResizeSensor'
import escape from 'licia/escape'
import LunaDragSelector from 'luna-drag-selector'
import keyCode from 'licia/keyCode'
import isObj from 'licia/isObj'
import defaults from 'licia/defaults'
import filter from 'licia/filter'
import pointerEvent from 'licia/pointerEvent'

/** IHotkey */
export interface IHotkey {
  /** Move selection left. */
  left?: string
  /** Move selection right. */
  right?: string
  /** Move selection up. */
  up?: string
  /** Move selection down. */
  down?: string
  /** Open selected icon. */
  open?: string
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Icon size. */
  size?: number
  /** Icon filter. */
  filter?: string | RegExp | types.AnyFn
  /** Whether icon is selectable.  */
  selectable?: boolean
  /** Allow multiple selections. */
  multiSelections?: boolean
  /** Enable hotkey or custom hotkey bindings. */
  hotkey?: boolean | IHotkey
}

const DEFAULT_HOTKEY: Required<IHotkey> = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
  open: 'enter',
}

/** IIcon */
export interface IIcon {
  src: string
  name: string
  /** Title shown on hover. */
  title?: string
  style?: types.PlainObj<any>
  className?: string
}

const GAP = 20
const MIN_APPEND_INTERVAL = 100

/**
 * Show list of icons and their names.
 *
 * @example
 * const iconList = new LunaIconList(container, {
 *   multiSelections: true,
 * })
 * iconList.setIcons([
 *   {
 *     src: '/logo.png',
 *     name: 'Luna',
 *   },
 * ])
 * iconList.on('select', (icons) => {
 *   console.log(icons)
 * })
 */
export default class IconList extends Component<IOptions> {
  private resizeSensor: ResizeSensor
  private icons: Icon[] = []
  private displayIcons: Icon[] = []
  private frag: DocumentFragment = document.createDocumentFragment()
  private appendTimer: NodeJS.Timeout | null = null
  private onResize: () => void
  private $iconContainer: $.$
  private iconContainer: HTMLElement
  private selectedIcons: Icon[] = []
  private selectionAnchor: Icon | null = null
  private dragSelector: LunaDragSelector | null = null
  private dragSelecting = false
  private selectionBeforeDrag: Icon[] = []
  private ignoreClick = false
  private columnCount = 1
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'icon-list' }, options)

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      this.updateColumnCount()
    }, 16)

    this.initOptions(options, {
      size: 48,
      selectable: true,
      multiSelections: false,
      hotkey: true,
    })

    this.initTpl()
    this.$iconContainer = this.find('.icon-container')
    this.iconContainer = this.$iconContainer.get(0) as HTMLElement

    this.updateDragSelector()
    this.updateTabIndex()
    this.bindEvent()
  }
  destroy() {
    this.$container.rmAttr('tabindex')
    super.destroy()
    this.resizeSensor.destroy()
  }
  /** Focus icon list. */
  focus() {
    this.container.focus()
  }
  /** Get selected icons. */
  getSelected(): Icon[] {
    return this.selectedIcons.slice()
  }
  /** Select icon by index. */
  select(index = 0): boolean {
    if (
      !this.options.selectable ||
      index < 0 ||
      index >= this.displayIcons.length
    ) {
      return false
    }
    const icon = this.displayIcons[index]
    this.selectSingle(icon)
    icon.container.scrollIntoView({ block: 'nearest' })
    return true
  }
  /** Set icons. */
  setIcons(icons: Array<IIcon>) {
    this.setSelectedIcons([])
    this.selectionAnchor = null
    this.icons = []
    this.displayIcons = []

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
    this.$iconContainer.html('')
    this.icons = []
    this.displayIcons = []
    this.setSelectedIcons([])
    this.selectionAnchor = null

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
    this.iconContainer.appendChild(this.frag)
    this.appendTimer = null
    this.updateColumnCount()
  }
  private getActiveIcon(): Icon | null {
    const { selectedIcons } = this
    return selectedIcons.length ? selectedIcons[selectedIcons.length - 1] : null
  }
  private getEventIcons(icon: Icon): Icon | Icon[] {
    return this.options.multiSelections ? this.getSelected() : icon
  }
  private isSameSelection(icons: Icon[]) {
    const { selectedIcons } = this
    if (selectedIcons.length !== icons.length) {
      return false
    }
    for (let i = 0, len = icons.length; i < len; i++) {
      if (selectedIcons[i] !== icons[i]) {
        return false
      }
    }
    return true
  }
  private selectSingle(icon: Icon) {
    this.setSelectedIcons([icon])
    this.selectionAnchor = icon
  }
  private setSelectedIcons(icons: Icon[], emitEvent = true) {
    if (!this.options.selectable && icons.length > 0) {
      return
    }

    if (this.isSameSelection(icons)) {
      return
    }

    const prevEmpty = this.selectedIcons.length === 0
    each(this.selectedIcons, (icon) => icon.deselect())
    each(icons, (icon) => icon.select())
    this.selectedIcons = icons.slice()

    if (emitEvent) {
      this.emitSelectionChange(prevEmpty)
    }
  }
  private emitSelectionChange(prevEmpty: boolean) {
    if (this.selectedIcons.length === 0) {
      if (!prevEmpty) {
        this.emit('deselect')
      }
      return
    }
    this.emit(
      'select',
      this.options.multiSelections ? this.getSelected() : this.getActiveIcon()
    )
  }
  private toggleIcon(icon: Icon) {
    let icons = this.selectedIcons.slice()
    if (contain(icons, icon)) {
      icons = filter(icons, (item) => item !== icon)
      if (this.selectionAnchor === icon) {
        this.selectionAnchor = icons[icons.length - 1] || null
      }
    } else {
      icons.push(icon)
      this.selectionAnchor = icon
    }
    this.setSelectedIcons(icons)
  }
  private selectRangeTo(icon: Icon) {
    const { displayIcons } = this
    const anchor = this.selectionAnchor || this.getActiveIcon() || icon
    const start = displayIcons.indexOf(anchor)
    const end = displayIcons.indexOf(icon)
    if (start < 0 || end < 0) {
      this.selectSingle(icon)
      return
    }
    const from = Math.min(start, end)
    const to = Math.max(start, end)
    this.setSelectedIcons(displayIcons.slice(from, to + 1))
  }
  private updateDragSelector = () => {
    const enabled = this.options.selectable && this.options.multiSelections
    if (enabled && !this.dragSelector) {
      this.dragSelector = new LunaDragSelector(this.container)
      this.addSubComponent(this.dragSelector)
      this.dragSelector.on('select', this.onDragSelect)
      this.dragSelector.on('change', this.onDragChange)
    } else if (!enabled && this.dragSelector) {
      this.removeSubComponent(this.dragSelector)
      this.dragSelector.destroy()
      this.dragSelector = null
      this.dragSelecting = false
      this.selectionBeforeDrag = []
    }
  }
  private onDragSelect = () => {
    if (!this.dragSelector || !this.dragSelector.hasArea()) {
      return
    }
    if (!this.dragSelecting) {
      this.selectionBeforeDrag = this.selectedIcons.slice()
    }
    this.dragSelecting = true
    const selected = filter(this.displayIcons, (icon) =>
      this.dragSelector!.isSelected(icon.container)
    )
    this.setSelectedIcons(selected, false)
  }
  private onDragChange = () => {
    if (!this.dragSelecting) {
      return
    }
    this.dragSelecting = false
    this.ignoreClick = true
    const before = this.selectionBeforeDrag
    this.selectionBeforeDrag = []
    if (this.isSameSelection(before)) {
      return
    }
    this.selectionAnchor = this.getActiveIcon()
    this.emitSelectionChange(before.length === 0)
  }
  private getHotkey(): Required<IHotkey> | false {
    const { hotkey } = this.options
    if (!hotkey) {
      return false
    }
    return defaults(
      isObj(hotkey) ? { ...(hotkey as IHotkey) } : {},
      DEFAULT_HOTKEY
    )
  }
  private updateTabIndex = () => {
    if (this.options.hotkey) {
      this.$container.attr('tabindex', '0')
    } else {
      this.$container.rmAttr('tabindex')
    }
  }
  private onKeydown = (e: any) => {
    const hotkey = this.getHotkey()
    if (!hotkey || !this.options.selectable || !this.displayIcons.length) {
      return
    }

    const event: KeyboardEvent = e.origEvent
    const activeIcon = this.getActiveIcon()
    let idx = activeIcon ? this.displayIcons.indexOf(activeIcon) : -1
    let delta = 0

    switch (event.keyCode) {
      case keyCode(hotkey.left):
        delta = -1
        break
      case keyCode(hotkey.right):
        delta = 1
        break
      case keyCode(hotkey.up):
        delta = -this.columnCount
        break
      case keyCode(hotkey.down):
        delta = this.columnCount
        break
      case keyCode(hotkey.open):
        if (activeIcon) {
          e.preventDefault()
          this.emit('click', event, this.getEventIcons(activeIcon))
        }
        return
      default:
        return
    }

    e.preventDefault()
    if (idx < 0) {
      idx = 0
    } else {
      idx += delta
    }
    if (idx < 0 || idx >= this.displayIcons.length) {
      return
    }

    if (
      this.options.multiSelections &&
      event.shiftKey &&
      this.selectionAnchor
    ) {
      this.selectRangeTo(this.displayIcons[idx])
      this.displayIcons[idx].container.scrollIntoView({ block: 'nearest' })
    } else {
      this.select(idx)
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
  private initTpl() {
    this.$container.html(this.c('<div class="icon-container"></div>'))
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)

    const self = this
    const itemClass = this.c('.icon, .name')

    this.$iconContainer
      .on(pointerEvent('down'), this.c('.item'), (e: any) => {
        e.stopPropagation()
      })
      .on('click', itemClass, function (this: any, e: any) {
        e.stopPropagation()
        const item = this.parentNode
        const icon = item.icon
        const event: MouseEvent = e.origEvent
        self.focus()

        if (self.options.selectable) {
          const multi = self.options.multiSelections
          if (multi && (event.metaKey || event.ctrlKey)) {
            self.toggleIcon(icon)
          } else if (multi && event.shiftKey) {
            self.selectRangeTo(icon)
          } else if (
            !multi ||
            self.selectedIcons.length <= 1 ||
            !contain(self.selectedIcons, icon)
          ) {
            self.selectSingle(icon)
          }
        }

        setTimeout(() => {
          if (item.hasDoubleClick) {
            return
          }
          self.emit('click', e.origEvent, self.getEventIcons(icon))
        }, 200)
      })
      .on('dblclick', itemClass, function (this: any, e: any) {
        e.stopPropagation()
        const item = this.parentNode
        const icon = item.icon
        item.hasDoubleClick = true
        self.emit('dblclick', e.origEvent, self.getEventIcons(icon))
        setTimeout(() => {
          item.hasDoubleClick = false
        }, 300)
      })
      .on('contextmenu', itemClass, function (this: any, e: any) {
        e.preventDefault()
        e.stopPropagation()
        const icon = this.parentNode.icon
        self.focus()
        if (self.options.selectable && !contain(self.selectedIcons, icon)) {
          self.selectSingle(icon)
        }
        self.emit('contextmenu', e.origEvent, self.getEventIcons(icon))
      })

    this.$container
      .on('click', () => {
        if (this.ignoreClick) {
          this.ignoreClick = false
          return
        }
        this.setSelectedIcons([])
        this.selectionAnchor = null
      })
      .on('keydown', this.onKeydown)

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
          this.setSelectedIcons(
            filter(this.selectedIcons, (icon) => this.filterIcon(icon))
          )
          if (this.selectionAnchor && !this.filterIcon(this.selectionAnchor)) {
            this.selectionAnchor = this.getActiveIcon()
          }
          this.render()
          break
        case 'hotkey':
          this.updateTabIndex()
          break
        case 'selectable':
        case 'multiSelections':
          this.updateDragSelector()
          if (!this.options.selectable) {
            this.setSelectedIcons([])
            this.selectionAnchor = null
          } else if (
            !this.options.multiSelections &&
            this.selectedIcons.length > 1
          ) {
            const active = this.getActiveIcon()
            if (active) {
              this.selectSingle(active)
            }
          }
          break
      }
    })
  }
  private updateColumnCount = () => {
    const { $iconContainer, c } = this
    const containerWidth = $iconContainer.offset().width

    const size = this.options.size + 16
    const columnCount = Math.max(1, Math.floor(containerWidth / (size + GAP)))

    if (this.icons.length > columnCount) {
      this.columnCount = columnCount
      const gap = Math.floor(
        (containerWidth - columnCount * size) / columnCount
      )
      $iconContainer.addClass(c('grid'))
      $iconContainer.css({
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gap: `${GAP}px ${gap}px`,
        paddingLeft: `${gap / 2}px`,
        paddingRight: `${gap / 2}px`,
        paddingBottom: `${GAP}px`,
      })
    } else {
      this.columnCount = this.displayIcons.length || 1
      $iconContainer.rmClass(c('grid'))
      $iconContainer.css({
        gap: '0',
        paddingLeft: `${GAP / 2}px`,
        paddingRight: `${GAP / 2}px`,
      })
    }
  }
  private render() {
    const { displayIcons, $iconContainer, iconContainer, container } = this

    const scrollTop = container.scrollTop

    const frag = document.createDocumentFragment()
    $iconContainer.html('')
    each(displayIcons, (icon) => {
      frag.appendChild(icon.container)
    })
    iconContainer.appendChild(frag)
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
    const $img = this.$icon.find('img')
    if (data.className) {
      $img.addClass(data.className)
    }
    $img.css(data.style || {})
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
    const { src, name, title } = data
    const titleAttr = title ? ` title="${escape(title)}"` : ''

    const nameTitleAttr = ` title="${escape(title || name)}"`

    $container.append(
      this.iconList.c(`
      <div class="icon"${titleAttr}>
        <img src="${src}" draggable="false"></img>
      </div>
      <div class="name"${nameTitleAttr}>
        <div class="name-wrapper">${name}</div>
      </div>
    `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, IconList)
}
