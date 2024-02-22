import Painter, { Layer } from '../'
import $ from 'licia/$'
import h from 'licia/h'
import Emitter from 'licia/Emitter'
import types from 'licia/types'
import Zoom from './Zoom'
import { eventPage } from '../../share/util'
import LunaToolbar from 'luna-toolbar'

export default class Tool extends Emitter {
  protected painter: Painter
  protected x = -1
  protected lastX = -1
  protected y = -1
  protected lastY = -1
  protected $viewport: $.$
  protected viewport: HTMLDivElement
  protected $viewportOverlay: $.$
  protected $canvas: $.$
  protected ctx: CanvasRenderingContext2D
  protected canvas: HTMLCanvasElement
  protected $toolbar: $.$
  protected $tool: $.$
  protected $cursor: $.$
  protected cursor: HTMLDivElement
  protected toolbar: LunaToolbar
  protected options: types.PlainObj<any> = {}
  protected isUsing = false
  constructor(painter: Painter, name: string, icon?: string) {
    super()
    this.painter = painter
    const { c } = painter

    this.viewport = painter.$container
      .find(c('.viewport'))
      .get(0) as HTMLDivElement
    this.$viewport = $(this.viewport)

    this.$viewportOverlay = painter.$container.find(c('.viewport-overlay'))

    this.canvas = painter.getCanvas()
    this.ctx = this.canvas.getContext('2d')!
    this.$canvas = $(this.canvas)

    this.$toolbar = painter.$container.find(c('.toolbar'))
    const toolbar = new LunaToolbar(h('div'))
    this.toolbar = toolbar
    toolbar.on('change', (key, val) => {
      this.setOption(key, val, false)
    })
    painter.addSubComponent(toolbar)

    this.$cursor = painter.$container.find(c('.cursor'))
    this.cursor = this.$cursor.get(0) as HTMLDivElement

    const tool = h(c('.tool'))
    const $tool = $(tool)
    if (!icon) {
      icon = name
    }
    $tool.html(c(`<span class="icon icon-${icon}"></span>`))
    this.$tool = $tool
    this.$tool.on('click', () => painter.useTool(name))
    painter.$container.find(c('.tools')).append(tool)
  }
  setOption(name: string, val: any, renderToolbar = true) {
    const oldVal = this.options[name]
    this.options[name] = val
    this.emit('optionChange', name, val, oldVal)

    if (renderToolbar) {
      this.renderToolbar()
    }
  }
  onDragStart(e: any) {
    this.getXY(e)
  }
  onDragMove(e: any) {
    this.getXY(e)
  }
  onDragEnd(e: any) {
    this.getXY(e)
  }
  onUse() {
    this.isUsing = true
    this.renderToolbar()

    this.$toolbar.append(this.toolbar.container)
    this.$tool.addClass(this.painter.c('selected'))
  }
  onUnuse() {
    this.isUsing = false
    this.toolbar.$container.remove()
    this.$tool.rmClass(this.painter.c('selected'))
  }
  onClick(e: any) {
    this.getXY(e)
  }
  onMouseMove(e: any) {
    const { $cursor, $viewportOverlay } = this
    const overlayOffset = $viewportOverlay.offset()

    const x = eventPage('x', e) - overlayOffset.left
    const y = eventPage('y', e) - overlayOffset.top

    if (x >= overlayOffset.width || y >= overlayOffset.height) {
      $cursor.css({
        opacity: 0,
      })
    } else {
      $cursor.css({
        left: x,
        top: y,
        opacity: 1,
      })
    }
  }
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  onMouseEnter(e: any) {
    this.$cursor.css({
      opacity: 1,
    })
  }
  onMouseLeave(e: any) {
    this.$cursor.css({
      opacity: 0,
    })
  }
  onZoom() {}
  onRenderLayer(layer: Layer): HTMLCanvasElement | void {}
  protected renderToolbar() {
    this.toolbar.clear()
  }
  private getXY(e: any) {
    const { $canvas } = this
    const offset = $canvas.offset()
    const pageX = eventPage('x', e)
    const pageY = eventPage('y', e)

    const zoom = this.painter.getTool('zoom') as Zoom
    const ratio = zoom.getRatio()
    const x = Math.floor((pageX - offset.left) / ratio)
    const y = Math.floor((pageY - offset.top) / ratio)

    this.lastX = this.x
    this.x = x
    this.lastY = this.y
    this.y = y
  }
}
