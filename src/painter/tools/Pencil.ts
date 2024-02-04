import Tool from './Tool'
import types from 'licia/types'

export default class Pencil extends Tool {
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
    const color = 'rgb(0,0,0)'
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    this.painter.updateCanvas()
  }
}
