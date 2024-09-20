import Component, { IComponentOptions } from '../share/Component'
import h from 'licia/h'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import isUrl from 'licia/isUrl'
import uuid from 'licia/uuid'
import types from 'licia/types'
import each from 'licia/each'
import max from 'licia/max'
import isEmpty from 'licia/isEmpty'
import pointerEvent from 'licia/pointerEvent'
import { eventClient, exportCjs } from '../share/util'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Width of the window. */
  width?: number
  /** Height of the window. */
  height?: number
  /** Offset to the left of the viewport. */
  x?: number
  /** Offset to the top of the viewport. */
  y?: number
  /** Title of the window. */
  title?: string
  /** Content to display, url is supported. */
  content?: string | HTMLElement
  /** Minimum width of the window. */
  minWidth?: number
  /** Minimum height of the window. */
  minHeight?: number
}

let index = 0
const windows: types.PlainObj<Window> = {}

/**
 * HTML5 window manager.
 *
 * @example
 * const win = new LunaWindow({
 *   title: 'Window Title',
 *   x: 50,
 *   y: 50,
 *   width: 800,
 *   height: 600,
 *   content: 'This is the content.'
 * })
 * win.show()
 */
export default class Window extends Component<IOptions> {
  private $title: $.$
  private $titleBar: $.$
  private $body: $.$
  private $titleBarRight: $.$
  private $maximizeBtn: $.$
  private $minimizeBtn: $.$
  private $taskBarItem: $.$
  private $resizer: $.$
  private startX = 0
  private startY = 0
  private id = uuid()
  private isFocus = false
  private isMaximized = false
  private action = ''
  constructor(options: IOptions) {
    super(h('div'), { compName: 'window' }, options)
    this.$container.addClass(this.c('hidden'))

    this.initOptions(options, {
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      title: '',
      content: '',
      minWidth: 200,
      minHeight: 150,
    })

    if (this.options.minWidth < 200) {
      this.options.minWidth = 200
    }
    if (this.options.minHeight < 150) {
      this.options.minHeight = 150
    }

    this.initTpl()

    this.$title = this.find('.title')
    this.$titleBar = this.find('.title-bar')
    this.$titleBarRight = this.find('.title-bar-right')
    this.$maximizeBtn = this.find('.icon-maximize')
    this.$minimizeBtn = this.find('.icon-minimize')
    this.$body = this.find('.body')
    this.$resizer = this.find('.resizer')
    this.$taskBarItem = this.createTaskBarItem()

    this.render()

    const $desktop = this.createDesktop()
    $desktop.append(this.container)

    this.bindEvent()

    windows[this.id] = this
  }
  focus = () => {
    const { c } = this

    if (this.isFocus) {
      return
    }

    this.isFocus = true
    this.$container.addClass(c('active')).css({ zIndex: index++ })
    this.$taskBarItem.addClass(c('active'))
    each(windows, (window, id) => {
      if (id !== this.id) {
        window.blur()
      }
    })
  }
  /** Show the window. */
  show = () => {
    this.$container.rmClass(this.c('hidden'))
    this.focus()
  }
  /** Minimize the window. */
  minimize = () => {
    this.$container.addClass(this.c('hidden'))
    this.blur()
  }
  /** Maximize the window. */
  maximize() {
    const { c } = this

    this.isMaximized = true
    this.$resizer.hide()
    this.$maximizeBtn.rmClass(c('icon-maximize'))
    this.$maximizeBtn.addClass(c('icon-maximized'))
    this.renderWindow()
  }
  destroy = () => {
    this.$taskBarItem.remove()
    this.$container.remove()
    delete windows[this.id]
    super.destroy()
    if (isEmpty(windows)) {
      this.createDesktop().remove()
    }
  }
  private restore() {
    const { c } = this

    this.isMaximized = false
    this.$resizer.show()
    this.$maximizeBtn.rmClass(c('icon-maximized'))
    this.$maximizeBtn.addClass(c('icon-maximize'))
    this.renderWindow()
  }
  private blur() {
    const { c } = this
    this.isFocus = false
    this.$container.rmClass(c('active'))
    this.$taskBarItem.rmClass(c('active'))
  }
  private moveTo(x: number, y: number) {
    this.$container.css({
      left: x,
      top: y,
    })
  }
  private resizeTo(width: number | string, height: number | string) {
    const { minWidth, minHeight } = this.options
    if (typeof width === 'number' && width < minWidth) {
      width = minWidth
    }
    if (typeof height === 'number' && height < minHeight) {
      height = minHeight
    }

    this.$container.css({
      width,
      height,
    })
  }
  private onMoveStart = (e: any) => {
    this.focus()
    e = e.origEvent
    this.startX = eventClient('x', e)
    this.startY = eventClient('y', e)
    $document.on(pointerEvent('move'), this.onMove)
    $document.on(pointerEvent('up'), this.onMoveEnd)
  }
  private onMove = (e: any, updateOptions = false) => {
    const { options } = this
    e = e.origEvent
    const deltaX = eventClient('x', e) - this.startX
    const deltaY = eventClient('y', e) - this.startY
    const newX = options.x + deltaX
    let newY = options.y + deltaY
    if (newY < 0) {
      newY = 0
    }
    if (this.isMaximized) {
      if (deltaX > 10 || deltaY > 10) {
        const { x, width } = this.options
        if (this.startX < x || this.startX > x + width) {
          this.options.x = this.startX - width / 2
        }
        this.options.y = 0
        this.restore()
      }
    } else {
      if (updateOptions) {
        this.setOption({
          x: newX,
          y: newY,
        })
      } else {
        this.moveTo(newX, newY)
      }
    }
  }
  private onMoveEnd = (e: any) => {
    this.onMove(e, true)
    $document.off(pointerEvent('move'), this.onMove)
    $document.off(pointerEvent('up'), this.onMoveEnd)
  }
  private onResizeStart = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    e = e.origEvent
    this.action = $(e.target).data('action') || ''
    if (!this.action) {
      return
    }
    const $desktop = this.createDesktop()
    $desktop.addClass(this.c(`cursor-${this.action}`))
    $desktop.addClass(this.c('resizing'))
    this.startX = eventClient('x', e)
    this.startY = eventClient('y', e)
    $document.on(pointerEvent('move'), this.onResizeMove)
    $document.on(pointerEvent('up'), this.onResizeEnd)
  }
  private onResizeMove = (e: any, updateOptions = false) => {
    e = e.origEvent
    const { action, options } = this
    const { x, y, width, height, minWidth, minHeight } = options

    const deltaX = eventClient('x', e) - this.startX
    const deltaY = eventClient('y', e) - this.startY

    let newX = x
    let newY = y
    let newWidth = width
    let newHeight = height

    function checkDirection(direction: string) {
      switch (direction) {
        case 'e':
          newWidth += deltaX
          newWidth = max(minWidth, newWidth)
          break
        case 's':
          newHeight += deltaY
          newHeight = max(minHeight, newHeight)
          break
        case 'w':
          if (width - deltaX < minWidth) {
            newX = x + width - minWidth
            newWidth = minWidth
          } else {
            newX += deltaX
            newWidth -= deltaX
          }
          break
        case 'n':
          if (y + deltaY < 0) {
            newHeight += y
            newY = 0
          } else if (height - deltaY < minHeight) {
            newY = y + height - minHeight
            newHeight = minHeight
          } else {
            newY += deltaY
            newHeight -= deltaY
          }
          break
      }
    }

    for (let i = 0, len = action.length; i < len; i++) {
      checkDirection(action[i])
    }

    if (updateOptions) {
      this.setOption({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      })
    } else {
      this.moveTo(newX, newY)
      this.resizeTo(newWidth, newHeight)
    }
  }
  private onResizeEnd = (e: any) => {
    this.onResizeMove(e, true)
    const $desktop = this.createDesktop()
    $desktop.rmClass(this.c(`cursor-${this.action}`))
    $desktop.rmClass(this.c('resizing'))
    $document.off(pointerEvent('move'), this.onResizeMove)
    $document.off(pointerEvent('up'), this.onResizeEnd)
    this.action = ''
  }
  private bindEvent() {
    const { c } = this

    this.on('optionChange', (name: string) => {
      switch (name) {
        case 'content':
          this.renderContent()
          break
        default:
          this.renderWindow()
          break
      }
    })

    this.$titleBarRight.on(pointerEvent('down'), (e) => {
      e.stopPropagation()
      this.focus()
    })

    this.$taskBarItem.on('click', this.show)

    this.$resizer.on(pointerEvent('down'), this.onResizeStart)

    this.$titleBar
      .on('click', c('.icon-close'), this.destroy)
      .on(pointerEvent('down'), this.onMoveStart)

    this.$minimizeBtn.on('click', (e) => {
      e.stopPropagation()
      this.minimize()
    })
    this.$maximizeBtn.on('click', () => {
      if (this.isMaximized) {
        this.restore()
      } else {
        this.maximize()
      }
    })

    this.$container.on('click', this.focus)
  }
  private createDesktop() {
    const { c } = this

    let $desktop = $(c('.desktop'))
    if (($desktop as any).length > 0) {
      return $desktop
    }

    const desktop = h(c('.desktop'))
    $desktop = $(desktop)
    $desktop.html(c('<div class="task-bar"></div>'))
    document.body.appendChild(desktop)
    return $desktop
  }
  private createTaskBarItem() {
    const { c } = this
    const $desktop = this.createDesktop()
    const $taskBar = $desktop.find(c('.task-bar'))

    const taskBarItem = h(c('.task-bar-item'))
    const $taskBarItem = $(taskBarItem)
    $taskBar.append(taskBarItem)

    return $taskBarItem
  }
  private render() {
    this.renderWindow()
    this.renderContent()
  }
  private renderWindow() {
    const { options } = this

    this.$title.text(options.title)
    this.$taskBarItem.attr('title', options.title)

    if (this.isMaximized) {
      this.moveTo(0, 0)
      this.resizeTo('100%', '100%')
    } else {
      this.resizeTo(options.width, options.height)
      this.moveTo(options.x, options.y)
    }
  }
  private renderContent() {
    const { $body, options } = this
    let { content } = options

    if (typeof content === 'string') {
      if (isUrl(content)) {
        content = `<iframe src="${content}" frameborder="0"></iframe>`
      }
      $body.html(content)
    } else {
      $body.html('')
      $body.append(content)
    }
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="title-bar">
        <div class="title-bar-left">
          <div class="title"></div>
        </div>
        <div class="title-bar-center"></div>
        <div class="title-bar-right">
          <span class="icon icon-minimize"></span>
          <span class="icon icon-maximize"></span>
          <span class="icon icon-close"></span>
        </div>
      </div>
      <div class="body"></div>
      <div class="resizer">
        <span class="line line-e" data-action="e"></span>
        <span class="line line-n" data-action="n"></span>
        <span class="line line-w" data-action="w"></span>
        <span class="line line-s" data-action="s"></span>
        <span class="point point-ne" data-action="ne"></span>
        <span class="point point-nw" data-action="nw"></span>
        <span class="point point-sw" data-action="sw"></span>
        <span class="point point-se" data-action="se"></span>
      </div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Window)
}
