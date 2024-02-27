import Painter, { Layer } from '../'
import defaults from 'licia/defaults'
import Tool from './Tool'
import nextTick from 'licia/nextTick'
import { CursorCircle } from './Pencil'
import { duplicateCanvas } from '../util'

export default class Brush extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private combinedCanvas: HTMLCanvasElement
  private brushCavnas: HTMLCanvasElement
  private brushCtx: CanvasRenderingContext2D
  private isDrawing = false
  private cursorCircle: CursorCircle
  private drawOptions: Required<IDrawOptions> = {
    color: 'rgb(0,0,0)',
    size: 4,
    opacity: 100,
    hardness: 100,
  }
  constructor(painter: Painter) {
    super(painter, 'brush')

    this.options = {
      size: 4,
      opacity: 100,
      hardness: 100,
    }

    this.cursorCircle = new CursorCircle(
      this.cursor,
      painter,
      this.options.size
    )

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!

    this.brushCavnas = document.createElement('canvas')
    this.brushCtx = this.brushCavnas.getContext('2d')!

    this.bindEvent()
  }
  onUse() {
    super.onUse()
    this.cursorCircle.render()
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
        color: this.painter.getForegroundColor(),
        size: options.size,
        opacity: options.opacity,
        hardness: options.hardness,
      })
      this.drawOptions = drawOptions as Required<IDrawOptions>
      this.generateBrush()
      this.draw(this.x, this.y)
      this.painter.renderCanvas()
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
    this.painter.renderCanvas()
  }
  onDragEnd(e: any) {
    if (!this.isDrawing) {
      return
    }

    super.onDragEnd(e)

    const { painter } = this

    this.isDrawing = false
    this.commitDraw(painter.getActiveLayer().getContext())
    painter.renderCanvas()
  }
  onRenderLayer(layer: Layer) {
    if (layer === this.painter.getActiveLayer() && this.isDrawing) {
      if (!this.combinedCanvas) {
        this.combinedCanvas = duplicateCanvas(layer.getCanvas())
      }
      const { canvas, combinedCanvas } = this
      const combinedCtx = combinedCanvas.getContext('2d')!
      combinedCanvas.width = canvas.width
      combinedCanvas.height = canvas.height
      combinedCtx.clearRect(0, 0, canvas.width, canvas.height)
      combinedCtx.drawImage(layer.getCanvas(), 0, 0)
      this.commitDraw(combinedCtx)
      return this.combinedCanvas
    }
  }
  onZoom() {
    super.onZoom()
    this.cursorCircle.render()
  }
  private draw(x: number, y: number) {
    const { canvas, drawCtx } = this
    const { size } = this.drawOptions

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const startX = size > 1 ? x - Math.floor((size - 1) / 2) : x
    const startY = size > 1 ? y - Math.round((size - 1) / 2) : y
    drawCtx.drawImage(this.brushCavnas, startX, startY)
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, options } = this

    toolbar.appendText(Painter.i18n.t('size') + ':')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText(Painter.i18n.t('hardness') + ':')
    toolbar.appendNumber('hardness', options.hardness, {
      min: 1,
      max: 100,
      step: 1,
    })
    toolbar.appendText(Painter.i18n.t('opacity') + ':')
    toolbar.appendNumber('opacity', options.opacity, {
      min: 1,
      max: 100,
      step: 1,
    })
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
  private generateBrush() {
    const { brushCavnas, brushCtx } = this
    const { size, hardness, color } = this.drawOptions

    brushCavnas.width = size
    brushCavnas.height = size
    brushCtx.clearRect(0, 0, size, size)
    brushCtx.fillStyle = color === 'transparent' ? 'black' : color

    const center = Math.round(size / 2)
    let radius = Math.round(size / 2)
    const opacityStep = 1 / radius / ((105 - hardness) / 25)
    let opacity = opacityStep
    for (; radius > 0; radius--) {
      brushCtx.globalAlpha = Math.min(opacity, 1)
      brushCtx.beginPath()
      brushCtx.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI)
      brushCtx.fill()
      opacity += opacityStep
    }

    brushCtx.globalAlpha = 1
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      if (name === 'size') {
        this.cursorCircle.setSize(val)
      }
    })
  }
}

interface IDrawOptions {
  color?: string
  size?: number
  hardness?: number
  opacity?: number
}
