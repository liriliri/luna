import Painter from './index'
import $ from 'licia/$'
import types from 'licia/types'
import { eventPage, eventClient } from '../share/util'

interface IPivot {
  x: number
  y: number
}

export class Tool {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onClick(e: any) {}
  private getXY(e: any) {
    const canvas = this.painter.getCanvas()
    const offset = $(canvas).offset()
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

export class Brush extends Tool {}

export class Pencil extends Tool {
  private options: types.PlainObj<any> = {
    size: 1,
  }
  setOption(name: string, val: any) {
    this.options[name] = val
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
  draw(x: number, y: number) {
    const canvas = this.painter.getCanvas()

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const { ctx } = this
    const { size } = this.options
    ctx.fillStyle = 'black'
    ctx.fillRect(x, y, size, size)
    this.painter.updateCanvas()
  }
}

export class Hand extends Tool {
  private startX = 0
  private startY = 0
  private startScrollLeft = 0
  private startScrollTop = 0
  onDragStart(e: any) {
    const { viewport } = this

    this.startX = eventClient('x', e)
    this.startY = eventClient('y', e)
    this.startScrollLeft = viewport.scrollLeft
    this.startScrollTop = viewport.scrollTop
  }
  onDragMove(e: any) {
    const { viewport } = this

    const deltaX = eventClient('x', e) - this.startX
    const deltaY = eventClient('y', e) - this.startY
    viewport.scrollLeft = this.startScrollLeft - deltaX
    viewport.scrollTop = this.startScrollTop - deltaY
  }
}

export class Zoom extends Tool {
  onClick(e: any) {
    const offset = this.$viewport.offset()

    this.zoom(e.altKey ? -0.1 : 0.1, {
      x: eventPage('x', e) - offset.left,
      y: eventPage('y', e) - offset.top,
    })
  }
  zoom(ratio: number, pivot?: IPivot) {
    ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio
    const offset = this.$canvas.offset()
    this.zoomTo((offset.width * ratio) / this.canvas.width, pivot)
  }
  zoomTo(ratio: number, pivot?: IPivot) {
    const { canvas } = this

    const width = canvas.width * ratio
    const height = canvas.height * ratio

    this.$canvas.css({
      width,
      height,
    })
  }
}
