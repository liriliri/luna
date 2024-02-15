import Tool from './Tool'
import Zoom from './Zoom'
import Painter from '../'
import { eventClient } from '../../share/util'

export default class Hand extends Tool {
  private startX = 0
  private startY = 0
  private startScrollLeft = 0
  private startScrollTop = 0
  constructor(painter: Painter) {
    super(painter)
    this.$cursor.html(painter.c(`<span class="icon icon-hand"></span>`))
  }
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
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar } = this
    toolbar.appendButton(
      '100%',
      () => {
        const zoom = this.painter.getTool('zoom') as Zoom
        zoom.zoomTo(1)
      },
      'hover'
    )
  }
}
