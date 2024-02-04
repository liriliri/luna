import Painter from '../index'
import $ from 'licia/$'
import { eventPage } from '../../share/util'

export default class Tool {
  protected painter: Painter
  protected x = -1
  protected lastX = -1
  protected y = -1
  protected lastY = -1
  protected ctx: CanvasRenderingContext2D
  protected $viewport: $.$
  protected viewport: HTMLDivElement
  protected $canvas: $.$
  protected canvas: HTMLCanvasElement
  constructor(painter: Painter) {
    this.painter = painter

    this.viewport = painter.$container
      .find(painter.c('.viewport'))
      .get(0) as HTMLDivElement
    this.$viewport = $(this.viewport)

    this.canvas = this.painter.getCanvas()
    this.$canvas = $(this.canvas)
  }
  onDragStart(e: any) {
    this.getXY(e)
    this.ctx = this.painter.getActiveLayer().getContext()
  }
  onDragMove(e: any) {
    this.getXY(e)
  }
  onDragEnd(e: any) {
    this.getXY(e)
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUse() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
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
