import Painter, { Layer } from '../'
import Tool from './Tool'
import $ from 'licia/$'
import Zoom from './Zoom'
import defaults from 'licia/defaults'
import nextTick from 'licia/nextTick'
import { duplicateCanvas } from '../util'
import hotkey from 'licia/hotkey'

export default class Pencil extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private combinedCanvas: HTMLCanvasElement
  private isDrawing = false
  private cursorCircle: CursorCircle
  private drawOptions: Required<IDrawOptions> = {
    color: 'rgb(0,0,0)',
    size: 1,
    opacity: 100,
  }
  constructor(painter: Painter) {
    super(painter, 'pencil')

    this.options = {
      size: 1,
      opacity: 100,
    }

    this.cursorCircle = new CursorCircle(
      this.cursor,
      painter,
      this.options.size
    )

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!

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
      })
      this.drawOptions = drawOptions as Required<IDrawOptions>
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
    this.isDrawing = false

    const { painter } = this

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
  protected renderToolbar() {
    super.renderToolbar()
    const { toolbar, options } = this

    toolbar.appendText(Painter.i18n.t('size') + ':')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText(Painter.i18n.t('opacity') + ':')
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
    const startX = size > 1 ? x - Math.floor((size - 1) / 2) : x
    const startY = size > 1 ? y - Math.round((size - 1) / 2) : y
    drawCtx.fillRect(startX, startY, size, size)
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
  private bindEvent() {
    const { cursorCircle } = this

    this.on('changeOption', (name, val) => {
      if (name === 'size') {
        cursorCircle.setSize(val)
      }
    })
    const options = {
      element: this.painter.container,
    }
    hotkey.on('[', options, () => {
      if (this.isUsing) {
        this.setOption('size', cursorCircle.decrease())
      }
    })
    hotkey.on(']', options, () => {
      if (this.isUsing) {
        this.setOption('size', cursorCircle.increase())
      }
    })
  }
}

export class CursorCircle {
  private $container: $.$
  private painter: Painter
  private size = 1
  constructor(container: HTMLDivElement, painter: Painter, size: number) {
    this.$container = $(container)
    this.painter = painter

    this.setSize(size)
  }
  setSize(size: number) {
    if (size === this.size) {
      return
    }
    if (size <= 0) {
      size = 1
    }
    if (size > 1000) {
      size = 1000
    }
    this.size = size
    this.render()
  }
  decrease() {
    let { size } = this
    const unit = this.getUnit()
    const remainder = size % unit
    size -= remainder === 0 ? unit : remainder
    this.setSize(size)
    return this.size
  }
  increase() {
    let { size } = this
    const unit = this.getUnit()
    const remainder = size % unit
    size += remainder === 0 ? unit : unit - remainder
    this.setSize(size)
    return this.size
  }
  render = () => {
    const { painter } = this
    let { size } = this
    size = Math.round(size * this.getRatio())
    let html = ''
    if (size > 1) {
      const viewportSize = size + 8
      const circle = (r: number, color: string) => {
        return `<circle cx="${viewportSize / 2}" cy="${
          viewportSize / 2
        }" r="${r}" style="fill:none;stroke:${color};stroke-width:1px;"/>`
      }
      html = `<svg width="${viewportSize}" height="${viewportSize}" viewBox="0 0 ${viewportSize} ${viewportSize}">
        ${circle(size / 2, '#000')}
        ${circle(size / 2 + 1, '#fff')}
        ${circle(size / 2 - 1, '#fff')}
      </svg>`
    } else {
      html = painter.c('<span class="icon icon-crosshair"></span>')
    }
    this.$container.html(html)
  }
  private getUnit() {
    const { size } = this
    if (size >= 300) {
      return 100
    }

    if (size >= 200) {
      return 50
    }

    if (size >= 100) {
      return 25
    }

    if (size >= 50) {
      return 10
    }

    if (size >= 10) {
      return 5
    }

    return 1
  }
  private getRatio() {
    const zoom = this.painter.getTool('zoom') as Zoom
    if (zoom) {
      return zoom.getRatio()
    }
    return 1
  }
}

interface IDrawOptions {
  color?: string
  size?: number
  opacity?: number
}
