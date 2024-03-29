import Tool from './Tool'
import Color from 'licia/Color'
import isEqual from 'licia/isEqual'
import Painter from '../'
import { colorDistance } from '../util'
import hotkey from 'licia/hotkey'

export default class PaintBucket extends Tool {
  constructor(painter: Painter) {
    super(painter, 'paintBucket', 'paint-bucket')

    this.options = {
      tolerance: 32,
    }

    this.bindEvent()
  }
  onUse() {
    super.onUse()
    const { painter } = this

    this.$cursor.html(painter.c(`<span class="icon icon-paint-bucket"></span>`))
    this.$cursor.find(painter.c('.icon-paint-bucket')).css({
      position: 'relative',
      left: -7,
      top: -3,
    })
  }
  onClick(e: any) {
    super.onClick(e)
    const { x, y, painter } = this
    const layer = painter.getActiveLayer()
    const canvas = layer.getCanvas()
    const ctx = layer.getContext()
    const w = canvas.width
    const h = canvas.height
    const point = { x, y }

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return
    }

    const foregroundColor = new Color(this.painter.getForegroundColor())
    const fillColor = Color.parse(foregroundColor.toRgb()).val
    fillColor[3] = 255

    const imageData = ctx.getImageData(0, 0, w, h)
    const { tolerance } = this.options

    const done: any = {}
    const check: number[] = []
    const idx = getIndex(point)
    const color = getColor(idx)
    put(idx)

    while (check.length) {
      const i = check.shift()!
      const x = i % w
      const y = (i - x) / w
      if (x > 0) checkIndex(i - 1)
      if (x < w - 1) checkIndex(i + 1)
      if (y > 0) checkIndex(i - w)
      if (y < h - 1) checkIndex(i + w)
    }

    ctx.putImageData(imageData, 0, 0)
    painter.renderCanvas()

    function getColor(idx: number) {
      idx *= 4
      const { data } = imageData
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    }

    function getIndex(p: { x: number; y: number }) {
      return p.y * w + p.x
    }

    function checkIndex(idx: number) {
      if (!done[idx]) {
        const c = getColor(idx)
        let passed = isEqual(c, color)
        if (!passed && tolerance) {
          const distance = colorDistance(c, color)
          passed = distance <= tolerance
        }
        if (passed) {
          put(idx)
        }
      }
    }

    function put(idx: number) {
      imageData.data[idx * 4] = fillColor[0]
      imageData.data[idx * 4 + 1] = fillColor[1]
      imageData.data[idx * 4 + 2] = fillColor[2]
      imageData.data[idx * 4 + 3] = 255
      done[idx] = true
      check.push(idx)
    }
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, options } = this

    toolbar.appendText(Painter.i18n.t('tolerance') + ':')
    toolbar.appendNumber('tolerance', options.tolerance, {
      min: 0,
      max: 255,
      step: 1,
    })
  }
  private bindEvent() {
    const { painter } = this

    hotkey.on(
      'g',
      {
        element: painter.container,
      },
      () => {
        if (!this.isUsing) {
          painter.useTool('paintBucket')
        }
      }
    )
  }
}
