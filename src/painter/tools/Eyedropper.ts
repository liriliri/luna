import Tool from './Tool'
import Painter from '../'
import hex from 'licia/hex'
import contain from 'licia/contain'

export default class Eyedropper extends Tool {
  private isAltDown = false
  constructor(painter: Painter) {
    super(painter)

    this.options = {
      sample: 'all',
    }

    this.bindEvent()
  }
  onUse() {
    super.onUse()
    const { painter } = this

    this.$cursor.html(painter.c(`<span class="icon icon-eyedropper"></span>`))
    this.$cursor.find(painter.c('.icon-eyedropper')).css({
      position: 'relative',
      left: 8,
      top: -6,
    })
  }
  onClick(e: any) {
    super.onClick(e)

    const { painter, canvas, x, y } = this
    let { ctx } = this
    if (this.options.sample === 'current') {
      ctx = painter.getActiveLayer().getContext()
    }

    const w = canvas.width
    const h = canvas.height

    const { data } = ctx.getImageData(0, 0, w, h)
    const idx = (y * w + x) * 4
    painter.setForegroundColor(
      `#${hex.encode([data[idx], data[idx + 1], data[idx + 2]])}`
    )
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, options } = this
    toolbar.appendText('Sample:')
    toolbar.appendSelect('sample', options.sample, {
      'Current Layer': 'current',
      'All Layers': 'all',
    })
  }
  private bindEvent() {
    const { painter } = this

    let currentToolName = ''
    document.addEventListener('keydown', (e) => {
      if (e.altKey && !this.isUsing) {
        currentToolName = painter.getCurrentToolName()
        if (contain(['brush', 'pencil'], currentToolName)) {
          this.isAltDown = true
          painter.useTool('eyedropper')
        }
      }
    })
    document.addEventListener('keyup', () => {
      if (this.isAltDown) {
        this.isAltDown = false
        painter.useTool(currentToolName)
      }
    })
  }
}
