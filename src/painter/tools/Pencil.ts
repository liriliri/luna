import Painter, { Layer } from '../'
import Tool from './Tool'

export default class Pencil extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private isDrawing = false
  constructor(painter: Painter) {
    super(painter)

    this.options = {
      size: 1,
      opacity: 100,
    }

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!
  }
  onDragStart(e: any) {
    super.onDragStart(e)

    const { canvas, drawCanvas, drawCtx } = this
    drawCanvas.width = canvas.width
    drawCanvas.height = canvas.height
    drawCtx.clearRect(0, 0, canvas.width, canvas.height)

    this.isDrawing = true
    this.draw(this.x, this.y)
  }
  onDragMove(e: any) {
    super.onDragMove(e)
    const { x, y, lastX, lastY } = this

    const delta = {
      x: x - lastX,
      y: y - lastY,
    }
    if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
      const steps = Math.max(Math.abs(delta.x), Math.abs(delta.y))
      delta.x /= steps
      delta.y /= steps
      for (let i = 0; i < steps; i++) {
        const x = lastX + Math.round(delta.x * i)
        const y = lastY + Math.round(delta.y * i)
        this.draw(x, y)
      }
    }

    this.draw(x, y)
  }
  onDragEnd(e: any) {
    super.onDragEnd(e)
    this.isDrawing = false

    const { painter } = this

    this.commitDraw(painter.getActiveLayer().getContext())
    painter.renderCanvas()
  }
  onAfterRenderLayer(layer: Layer) {
    if (layer === this.painter.getActiveLayer() && this.isDrawing) {
      this.commitDraw(this.ctx)
    }
  }
  protected renderToolbar() {
    super.renderToolbar()
    const { toolbar, options } = this

    toolbar.appendText('Size:')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText('Opacity:')
    toolbar.appendNumber('opacity', options.opacity, {
      min: 1,
      max: 100,
      step: 1,
    })
  }
  private draw(x: number, y: number) {
    const { canvas, drawCtx } = this

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const { size } = this.options
    const color = 'rgb(0,0,0)'
    drawCtx.fillStyle = color
    const centerX = size > 1 ? x - Math.floor((size - 1) / 2) : x
    const centerY = size > 1 ? y - Math.floor((size - 1) / 2) : y
    drawCtx.fillRect(centerX, centerY, size, size)
    this.painter.renderCanvas()
  }
  private commitDraw(ctx: CanvasRenderingContext2D) {
    const { drawCanvas } = this
    ctx.globalAlpha = this.options.opacity / 100
    ctx.drawImage(drawCanvas, 0, 0)
    ctx.globalAlpha = 1
  }
}
