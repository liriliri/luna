import Painter from './index'
import $ from 'licia/$'
import types from 'licia/types'
import { eventPage } from '../share/util'

export class Tool {
  protected painter: Painter
  protected x = 0
  protected lastX = 0
  protected y = 0
  protected lastY = 0
  protected ctx: CanvasRenderingContext2D
  constructor(painter: Painter) {
    this.painter = painter
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
  private getXY(e: any) {
    const canvas = this.painter.getCanvas()
    const offset = $(canvas).offset()
    const pageX = eventPage('x', e)
    const pageY = eventPage('y', e)

    let x = Math.floor(((pageX - offset.left) / offset.width) * canvas.width)
    let y = Math.floor(((pageY - offset.top) / offset.height) * canvas.height)

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      x = -1
      y = -1
    }

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

    if (x > -1 && y > -1) {
      if (lastX > -1 && lastY > -1) {
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
      }
      this.draw(this.x, this.y)
    }
  }
  draw(x: number, y: number) {
    const { ctx } = this
    const { size } = this.options
    ctx.fillStyle = 'black'
    ctx.fillRect(x, y, size, size)
    this.painter.updateCanvas()
  }
}
