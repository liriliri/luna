import Painter, { Layer } from '../'
import $ from 'licia/$'
import { eventPage } from '../../share/util'

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
  onUse() {}
  onUnuse() {}
  onAfterRenderLayer(layer: Layer) {}
  onClick(e: any) {}
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
