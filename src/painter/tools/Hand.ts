import Tool from './Tool'
import Zoom from './Zoom'
import Painter from '../'
import keyCode from 'licia/keyCode'
import { eventClient } from '../../share/util'

export default class Hand extends Tool {
  private startX = 0
  private startY = 0
  private startScrollLeft = 0
  private startScrollTop = 0
  private isSpaceDown = false
  constructor(painter: Painter) {
    super(painter)

    this.bindEvent()
  }
  onUse() {
    super.onUse()
    this.$cursor.html(this.painter.c(`<span class="icon icon-hand"></span>`))
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
  private bindEvent() {
    const { painter } = this

    let currentToolName = ''
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === keyCode('space') && !this.isUsing) {
        e.preventDefault()
        currentToolName = painter.getCurrentToolName()
        this.isSpaceDown = true
        painter.useTool('hand')
      }
    })
    // Prevent scrolling
    document.addEventListener('keypress', (e) => {
      if (this.isSpaceDown) {
        e.preventDefault()
      }
    })
    document.addEventListener('keyup', () => {
      if (this.isSpaceDown) {
        this.isSpaceDown = false
        painter.useTool(currentToolName)
      }
    })
  }
}
