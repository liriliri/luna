import Painter from './index'
import $ from 'licia/$'
import types from 'licia/types'
import Tween from 'licia/Tween'
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
    const color = 'rgb(0,0,0)'
    ctx.fillStyle = color
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
  centerCanvas() {
    const { viewport } = this
    const { width: viewportWidth, height: viewportHeight } =
      this.painter.getViewportSize()
    viewport.scrollLeft = (viewport.scrollWidth - viewportWidth) / 2
    viewport.scrollTop = (viewport.scrollHeight - viewportHeight) / 2
  }
}

export class Zoom extends Tool {
  private isZooming = false
  constructor(painter: Painter) {
    super(painter)

    this.bindEvent()
  }
  onUse() {
    const { $canvas } = this

    if (!$canvas.attr('style')) {
      const { width, height } = $canvas.offset()
      $canvas.css({
        width,
        height,
      })
    }
  }
  onClick(e: any) {
    const offset = this.$viewport.offset()

    this.zoom(e.altKey ? -0.3 : 0.3, {
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
    if (this.isZooming) {
      return
    }
    this.isZooming = true

    const { canvas, viewport, $canvas } = this

    const newWidth = canvas.width * ratio
    const newHeight = canvas.height * ratio
    const offset = this.$canvas.offset()
    const { width, height } = offset
    let { left, top } = offset
    const deltaWidth = newWidth - width
    const deltaHeight = newHeight - height
    const { scrollLeft, scrollTop } = viewport
    const viewportOffset = this.$viewport.offset()
    left -= viewportOffset.left
    top -= viewportOffset.top
    const { scrollWidth, scrollHeight } = viewport
    const marginLeft = (scrollWidth - width) / 2
    const marginTop = (scrollHeight - height) / 2

    if (!pivot) {
      pivot = {
        x: width / 2 + left,
        y: height / 2 + top,
      }
    }

    const { width: viewportWidth, height: viewportHeight } =
      this.painter.getViewportSize()
    const newMarginLeft = viewportWidth - Math.min(newWidth, 100)
    const newMarginTop = viewportHeight - Math.min(newHeight, 100)
    const deltaMarginLeft = newMarginLeft - marginLeft
    const deltaMarginTop = newMarginTop - marginTop

    const newScrollLeft =
      scrollLeft + deltaMarginLeft + deltaWidth * ((pivot.x - left) / width)
    const newScrollTop =
      scrollTop + deltaMarginTop + deltaHeight * ((pivot.y - top) / height)

    const tween = new Tween({
      scrollLeft,
      scrollTop,
      width,
      height,
    })

    tween
      .on('update', (target) => {
        $canvas.css({
          width: target.width,
          height: target.height,
        })
        viewport.scrollLeft = target.scrollLeft
        viewport.scrollTop = target.scrollTop
      })
      .on('end', () => {
        this.isZooming = false
      })

    tween
      .to(
        {
          scrollLeft: newScrollLeft,
          scrollTop: newScrollTop,
          width: newWidth,
          height: newHeight,
        },
        300,
        'linear'
      )
      .play()
  }
  private bindEvent() {
    this.$viewport.on('wheel', this.onWheel)
  }
  private onWheel = (e: any) => {
    e.preventDefault()

    e = e.origEvent
    if (!e.altKey) {
      return
    }

    const delta = e.deltaY > 0 ? 1 : -1

    const offset = this.$viewport.offset()
    this.zoom(-delta * 0.5, {
      x: eventPage('x', e) - offset.left,
      y: eventPage('y', e) - offset.top,
    })
  }
}
