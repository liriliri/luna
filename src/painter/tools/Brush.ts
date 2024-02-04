import Painter from '../index'
import Tool from './Tool'
import types from 'licia/types'
import h from 'licia/h'
import LunaToolbar from 'luna-toolbar'

export default class Pencil extends Tool {
  private drawCtx: CanvasRenderingContext2D
  private drawCanvas: HTMLCanvasElement
  private options: types.PlainObj<any> = {
    size: 1,
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
    })

    painter.addToolbar(toolbar)

    this.drawCanvas = document.createElement('canvas')
    this.drawCtx = this.drawCanvas.getContext('2d')!
  }
  onUse() {
    this.$toolbar.append(this.toolbar.container)
  }
  onUnuse() {
    this.toolbar.$container.remove()
  }
  setOption(name: string, val: any) {
    this.options[name] = val

    this.renderToolbar()
  }
  onDragStart(e: any) {
    super.onDragStart(e)

    const { canvas, drawCanvas, drawCtx } = this
    drawCanvas.width = canvas.width
    drawCanvas.height = canvas.height
    drawCtx.clearRect(0, 0, canvas.width, canvas.height)
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

    this.draw(this.x, this.y)
  }
  onDragEnd(e: any) {
    super.onDragEnd(e)

    const { painter } = this

    this.commitDraw(painter.getActiveLayer().getContext())
    painter.updateCanvas()
  }
  draw(x: number, y: number) {
    const { canvas, drawCtx } = this

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const { size } = this.options
    const color = 'rgb(0,0,0)'
    drawCtx.fillStyle = color
    drawCtx.fillRect(x, y, size, size)
    this.painter.updateCanvas()
    this.commitDraw(this.ctx)
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
}
