import Painter, { Layer } from '../'
import $ from 'licia/$'
import h from 'licia/h'
import types from 'licia/types'
import { eventPage } from '../../share/util'
import LunaToolbar from 'luna-toolbar'

export default class Tool {
  protected painter: Painter
  protected x = -1
  protected lastX = -1
  protected y = -1
  protected lastY = -1
  protected $viewport: $.$
  protected viewport: HTMLDivElement
  protected $canvas: $.$
  protected ctx: CanvasRenderingContext2D
  protected canvas: HTMLCanvasElement
  protected $toolbar: $.$
  protected toolbar: LunaToolbar
  protected options: types.PlainObj<any> = {}
  constructor(painter: Painter) {
    this.painter = painter

    this.viewport = painter.$container
      .find(painter.c('.viewport'))
      .get(0) as HTMLDivElement
    this.$viewport = $(this.viewport)

    this.canvas = painter.getCanvas()
    this.ctx = this.canvas.getContext('2d')!
    this.$canvas = $(this.canvas)

    this.$toolbar = painter.$container.find(painter.c('.toolbar'))

    const toolbar = new LunaToolbar(h('div'))
    this.toolbar = toolbar
    toolbar.on('change', (key, val) => {
      this.options[key] = val
    })
    painter.addSubComponent(toolbar)
  }
  setOption(name: string, val: any) {
    this.options[name] = val

    this.renderToolbar()
  }
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
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
    this.renderToolbar()

    this.$toolbar.append(this.toolbar.container)
  }
  onUnuse() {
    this.toolbar.$container.remove()
  }
  onAfterRenderLayer(layer: Layer) {}
  onClick(e: any) {
    this.getXY(e)
  }
  protected renderToolbar() {
    this.toolbar.clear()
  }
  private getXY(e: any) {
    const { canvas, $canvas } = this
    const offset = $canvas.offset()
    const pageX = eventPage('x', e)
    const pageY = eventPage('y', e)

    const x = Math.floor(((pageX - offset.left) / offset.width) * canvas.width)
    const y = Math.floor(((pageY - offset.top) / offset.height) * canvas.height)

    this.lastX = this.x
    this.x = x
    this.lastY = this.y
    this.y = y
  }
}
