import Tool from './Tool'
import Painter from '../index'
import Hand from './Hand'
import Tween from 'licia/Tween'
import $ from 'licia/$'
import h from 'licia/h'
import { eventPage } from '../../share/util'

interface IPivot {
  x: number
  y: number
}

export default class Zoom extends Tool {
  private isZooming = false
  private isAltDown = false
  private ratio = 1
  private $cursorIcon: $.$
  constructor(painter: Painter) {
    super(painter, 'zoom')

    this.options = {
      mode: 'in',
    }

    const { c } = painter
    this.$cursorIcon = $(h(`span${c('.icon')}${c('.icon-zoom-in')}`))

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

    this.$cursor.html('').append(this.$cursorIcon.get(0) as HTMLDivElement)
  }
  onUnuse() {
    super.onUnuse()
    this.$cursorIcon.remove()
  }
  onClick(e: any) {
    const offset = this.$viewport.offset()

    const ratio = this.options.mode === 'in' ? 0.3 : -0.3
    this.zoom(ratio, {
      x: eventPage('x', e) - offset.left,
      y: eventPage('y', e) - offset.top,
    })
  }
  zoom(ratio: number, pivot?: IPivot) {
    ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio
    const offset = this.$canvas.offset()
    this.zoomTo((offset.width * ratio) / this.canvas.width, true, pivot)
  }
  getRatio() {
    return this.ratio
  }
  zoomTo(ratio: number, animation = true, pivot?: IPivot) {
    if (this.isZooming) {
      return
    }
    this.isZooming = true
    this.ratio = ratio

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

    if (animation) {
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
          this.emit('change')
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
    } else {
      $canvas.css({
        width: newWidth,
        height: newHeight,
      })
      viewport.scrollLeft = newScrollLeft
      viewport.scrollTop = newScrollTop
      this.emit('change')
      this.isZooming = false
    }
  }
  fitScreen() {
    const { canvas, viewport } = this
    const sx = viewport.clientWidth / (canvas.width + 20)
    const sy = viewport.clientHeight / (canvas.height + 20)
    this.zoomTo(Math.min(sx, sy), false)
  }
  fillScreen() {
    const { canvas, viewport } = this
    const sx = viewport.clientWidth / canvas.width
    const sy = viewport.clientHeight / canvas.height
    this.zoomTo(Math.max(sx, sy), false)
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, painter, options } = this
    toolbar.appendButton(
      painter.c('<span class="icon icon-zoom-in"></span>'),
      () => {
        if (options.mode !== 'in') {
          this.setOption('mode', 'in')
        }
      },
      options.mode === 'in' ? 'active' : ''
    )
    toolbar.appendButton(
      painter.c('<span class="icon icon-zoom-out"></span>'),
      () => {
        if (options.mode !== 'out') {
          this.setOption('mode', 'out')
        }
      },
      options.mode === 'out' ? 'active' : ''
    )
    toolbar.appendSeparator()
    toolbar.appendButton(
      '100%',
      () => {
        this.zoomTo(1)
      },
      'hover'
    )
    toolbar.appendButton(
      'Fit Screen',
      () => {
        this.fitScreen()
        const hand = painter.getTool('hand') as Hand
        hand.centerCanvas()
      },
      'hover'
    )
    toolbar.appendButton(
      'Fill Screen',
      () => {
        this.fillScreen()
        const hand = painter.getTool('hand') as Hand
        hand.centerCanvas()
      },
      'hover'
    )
  }
  private bindEvent() {
    this.$viewport.on('wheel', this.onWheel)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && this.isUsing) {
        this.isAltDown = true
        this.toggleMode()
      }
    })
    document.addEventListener('keyup', () => {
      if (this.isAltDown) {
        this.isAltDown = false
        this.toggleMode()
      }
    })

    this.on('optionChange', (name, val) => {
      if (name === 'mode') {
        const { c } = this.painter
        const $icon = this.$cursorIcon
        $icon.rmClass(c('icon-zoom-in')).rmClass(c('icon-zoom-out'))
        $icon.addClass(c(`icon-zoom-${val}`))
      }
    })
  }
  private toggleMode = () => {
    this.setOption('mode', this.options.mode === 'in' ? 'out' : 'in')
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
