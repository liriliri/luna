import Painter, { Layer } from '../'
import Tool from './Tool'
import defaults from 'licia/defaults'
import nextTick from 'licia/nextTick'

export default class Pencil extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private isDrawing = false
  private drawOptions: Required<IDrawOptions> = {
    color: 'rgb(0,0,0)',
    size: 1,
    opacity: 100,
  }
  constructor(painter: Painter) {
    super(painter)

    this.options = {
      size: 1,
      opacity: 100,
    }

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!
  }
  onDragStart(e: any, drawOptions: IDrawOptions = {}) {
    super.onDragStart(e)

    const { canvas, drawCanvas, drawCtx, options } = this
    drawCanvas.width = canvas.width
    drawCanvas.height = canvas.height
    drawCtx.clearRect(0, 0, canvas.width, canvas.height)

    nextTick(() => {
      this.isDrawing = true
      defaults(drawOptions, {
        color: 'rgb(0,0,0)',
        size: options.size,
        opacity: options.opacity,
      })
      this.drawOptions = drawOptions as Required<IDrawOptions>
      this.draw(this.x, this.y)
    })
  }
  onDragMove(e: any) {
    if (!this.isDrawing) {
      return
    }

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
    if (!this.isDrawing) {
      return
    }

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

    const { size, color } = this.drawOptions
    drawCtx.fillStyle = color === 'transparent' ? 'black' : color
    const centerX = size > 1 ? x - Math.floor((size - 1) / 2) : x
    const centerY = size > 1 ? y - Math.floor((size - 1) / 2) : y
    drawCtx.fillRect(centerX, centerY, size, size)
    this.painter.renderCanvas()
  }
  private commitDraw(ctx: CanvasRenderingContext2D) {
    const { drawCanvas } = this
    const { color, opacity } = this.drawOptions
    ctx.globalAlpha = opacity / 100
    if (color === 'transparent') {
      ctx.globalCompositeOperation = 'destination-out'
    }
    ctx.drawImage(drawCanvas, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
}

interface IDrawOptions {
  color?: string
  size?: number
  opacity?: number
}
