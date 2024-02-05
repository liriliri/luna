import Painter, { Layer } from '../'
import Tool from './Tool'
import types from 'licia/types'
import h from 'licia/h'
import LunaToolbar from 'luna-toolbar'

export default class Pencil extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private brushCavnas: HTMLCanvasElement
  private brushCtx: CanvasRenderingContext2D
  private isDrawing = false
  private options: types.PlainObj<any> = {
    size: 4,
    opacity: 100,
    hardness: 100,
  }
  private toolbar: LunaToolbar
  constructor(painter: Painter) {
    super(painter)

    const toolbar = new LunaToolbar(h('div'))
    this.toolbar = toolbar
    this.renderToolbar()

    this.toolbar.on('change', (key, val) => {
      this.options[key] = val
      this.generateBrush()
    })

    painter.addSubComponent(toolbar)

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!

    this.brushCavnas = document.createElement('canvas')
    this.brushCtx = this.brushCavnas.getContext('2d')!
    this.generateBrush()
  }
  onUse() {
    this.$toolbar.append(this.toolbar.container)
  }
  onUnuse() {
    this.toolbar.$container.remove()
  }
  setOption(name: string, val: any) {
    this.options[name] = val
    this.generateBrush()

    this.renderToolbar()
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

    const { painter } = this

    this.isDrawing = false
    this.commitDraw(painter.getActiveLayer().getContext())
    painter.renderCanvas()
  }
  draw(x: number, y: number) {
    const { canvas, drawCtx } = this
    const { size } = this.options

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const centerX = size > 1 ? x - Math.floor((size - 1) / 2) : x
    const centerY = size > 1 ? y - Math.floor((size - 1) / 2) : y
    drawCtx.drawImage(this.brushCavnas, centerX, centerY)
    this.painter.renderCanvas()
  }
  onAfterRenderLayer(layer: Layer) {
    if (layer === this.painter.getActiveLayer() && this.isDrawing) {
      this.commitDraw(this.ctx)
    }
  }
  private commitDraw(ctx: CanvasRenderingContext2D) {
    const { drawCanvas } = this
    ctx.globalAlpha = this.options.opacity / 100
    ctx.drawImage(drawCanvas, 0, 0)
    ctx.globalAlpha = 1
  }
  private renderToolbar() {
    const { toolbar, options } = this

    toolbar.clear()
    toolbar.appendText('Size:')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText('Hardness:')
    toolbar.appendNumber('hardness', options.hardness, {
      min: 1,
      max: 100,
      step: 1,
    })
    toolbar.appendText('Opacity:')
    toolbar.appendNumber('opacity', options.opacity, {
      min: 1,
      max: 100,
      step: 1,
    })
  }
  private generateBrush() {
    const { brushCavnas, brushCtx } = this
    const { size, hardness } = this.options

    brushCavnas.width = size
    brushCavnas.height = size
    brushCtx.clearRect(0, 0, size, size)
    brushCtx.fillStyle = 'rgb(0,0,0)'

    const center = size / 2
    let radius = size / 2
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
}
