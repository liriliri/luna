import Tool from './Tool'
import Painter from '../index'
import Tween from 'licia/Tween'
import { eventPage } from '../../share/util'

interface IPivot {
  x: number
  y: number
}

export default class Zoom extends Tool {
  private isZooming = false
  constructor(painter: Painter) {
    super(painter)

    this.options = {
      zoomIn: true,
    }

    this.bindEvent()
  }
  onUse() {
    super.onUse()

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

    let ratio = this.options.zoomIn ? 0.3 : -0.3
    if (e.altKey) {
      ratio = -ratio
    }
    this.zoom(ratio, {
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

    const newMarginLeft = viewport.clientWidth - Math.min(newWidth, 100)
    const newMarginTop = viewport.clientHeight - Math.min(newHeight, 100)
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
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, painter, options } = this
    toolbar.appendButton(
      painter.c('<span class="icon icon-zoom-in"></span>'),
      () => {
        if (!options.zoomIn) {
          this.setOption('zoomIn', true)
        }
      },
      options.zoomIn ? 'active' : ''
    )
    toolbar.appendButton(
      painter.c('<span class="icon icon-zoom-out"></span>'),
      () => {
        if (options.zoomIn) {
          this.setOption('zoomIn', false)
        }
      },
      options.zoomIn ? '' : 'active'
    )
  }
  private bindEvent() {
    this.$viewport.on('wheel', this.onWheel)
  }
  private onWheel = (e: any) => {
    e = e.origEvent
    if (!e.altKey) {
      return
    }

    e.preventDefault()

    const delta = e.deltaY > 0 ? 1 : -1

    const offset = this.$viewport.offset()
    this.zoom(-delta * 0.5, {
      x: eventPage('x', e) - offset.left,
      y: eventPage('y', e) - offset.top,
    })
  }
}
