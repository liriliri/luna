import Component from '../share/Component'
import h from 'licia/h'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import isUrl from 'licia/isUrl'
import uuid from 'licia/uuid'
import types from 'licia/types'
import each from 'licia/each'
import max from 'licia/max'
import { drag, eventClient } from '../share/util'

const $document = $(document as any)

interface IOptions {
  width?: number
  height?: number
  x?: number
  y?: number
  title?: string
  content?: string | HTMLElement
  minWidth?: number
  minHeight?: number
}

let index = 0
const windows: types.PlainObj<Window> = {}
export default class Window extends Component<IOptions> {
  private $title: $.$
  private $titleBar: $.$
  private $body: $.$
  private $titleBarRight: $.$
  private $maximizeBtn: $.$
  private $resizer: $.$
  private startX = 0
  private startY = 0
  private id = uuid()
  private isFocus = false
  private isMaximized = false
  private action = ''
  constructor({
    width = 800,
    height = 600,
    x = 0,
    y = 0,
    title = '',
    content = '',
    minWidth = 200,
    minHeight = 150,
  }: IOptions) {
    super(h('div'), { compName: 'window' })
    this.$container.addClass(this.c('hidden'))

    if (minWidth < 200) {
      minWidth = 200
    }
    if (minHeight < 150) {
      minHeight = 150
    }

    this.options = {
      width,
      height,
      title,
      x,
      y,
      content,
      minWidth,
      minHeight,
    }

    this.initTpl()

    this.$title = this.find('.title')
    this.$titleBar = this.find('.title-bar')
    this.$titleBarRight = this.find('.title-bar-right')
    this.$maximizeBtn = this.find('.icon-maximize')
    this.$body = this.find('.body')
    this.$resizer = this.find('.resizer')

    this.render()

    const $desktop = this.createDesktop()
    $desktop.append(this.container)

    this.bindEvent()

    windows[this.id] = this
  }
  focus = () => {
    if (this.isFocus) {
      return
    }
    this.isFocus = true
    this.$container.addClass(this.c('active')).css({ zIndex: index++ })
    each(windows, (window, id) => {
      if (id !== this.id) {
        window.blur()
      }
    })
  }
  show() {
    this.$container.rmClass(this.c('hidden'))
    this.focus()
  }
  minimize = () => {
    this.$container.addClass(this.c('hidden'))
  }
  maximize() {
    const { c } = this

    this.isMaximized = true
    this.$resizer.hide()
    this.$maximizeBtn.rmClass(c('icon-maximize'))
    this.$maximizeBtn.addClass(c('icon-maximized'))
    this.renderWindow()
  }
  destroy = () => {
    this.$container.remove()
    delete windows[this.id]
    super.destroy()
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
    this.isFocus = false
    this.$container.rmClass(this.c('active'))
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
    $document.on(drag('move'), this.onMove)
    $document.on(drag('end'), this.onMoveEnd)
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
    $document.off(drag('move'), this.onMove)
    $document.off(drag('end'), this.onMoveEnd)
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
    $document.on(drag('move'), this.onResizeMove)
    $document.on(drag('end'), this.onResizeEnd)
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
    $document.off(drag('move'), this.onResizeMove)
    $document.off(drag('end'), this.onResizeEnd)
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

    this.$titleBarRight.on(drag('start'), (e) => {
      e.stopPropagation()
      this.focus()
    })

    this.$resizer.on(drag('start'), this.onResizeStart)

    this.$titleBar
      .on('click', c('.icon-close'), this.destroy)
      .on('click', c('.icon-minimize'), this.minimize)
      .on(drag('start'), this.onMoveStart)

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
    let $desktop = $(this.c('.desktop'))
    if (($desktop as any).length > 0) {
      return $desktop
    }

    const desktop = h(this.c('.desktop'))
    $desktop = $(desktop)
    document.body.appendChild(desktop)
    return $desktop
  }
  private render() {
    this.renderWindow()
    this.renderContent()
  }
  private renderWindow() {
    const { options } = this

    this.$title.text(options.title)

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

module.exports = Window
module.exports.default = Window
