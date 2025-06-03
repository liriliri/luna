import { eventPage, exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'
import pointerEvent from 'licia/pointerEvent'
import $ from 'licia/$'
import toEl from 'licia/toEl'

const $document = $(document as any)

/**
 * Drag selector for selecting multiple items.
 *
 * @example
 * const dragSelector = new DragSelector(container)
 * let selectedElements = []
 * dragSelector.on('select', () => {
 *   selectedElements = []
 *   if (dragSelector.isSelected(itemElement)) {
 *     selectedElements.push(itemElement)
 *   }
 * })
 * dragSelector.on('change', () => {
 *   console.log('Selection changed:', selectedElements)
 * })
 */
export default class DragSelector extends Component<IComponentOptions> {
  private startX = 0
  private startY = 0
  private $selectArea: $.$
  private selectArea: HTMLDivElement
  private left = 0
  private top = 0
  private right = 0
  private bottom = 0
  constructor(container: HTMLElement, options: IComponentOptions = {}) {
    super(container, { compName: 'drag-selector' }, options)

    this.$selectArea = $(toEl(this.c('<div class="select-area"></div>')))
    this.selectArea = this.$selectArea.get(0) as HTMLDivElement

    this.bindEvent()
  }
  /** Check whether an element is selected. */
  isSelected(el: HTMLElement): boolean {
    const { left, top, right, bottom } = this
    const offset: any = $(el).offset()
    offset.right = offset.left + offset.width
    offset.bottom = offset.top + offset.height

    return (
      offset.left < right &&
      offset.right > left &&
      offset.top < bottom &&
      offset.bottom > top
    )
  }
  private onDragStart = (e: any) => {
    const { $container } = this
    e = e.origEvent
    this.startX = eventPage('x', e)
    this.startY = eventPage('y', e)

    $container.append(this.selectArea)
    const offset = $container.offset()
    this.updateSelectArea(
      this.startX - offset.left,
      this.startY - offset.top,
      0,
      0
    )
    this.emit('select')

    $document.on(pointerEvent('move'), this.onDragMove)
    $document.on(pointerEvent('up'), this.onDragEnd)
  }
  private onDragMove = (e: any) => {
    e = e.origEvent

    const offset = this.$container.offset()
    let left = 0
    let top = 0

    const deltaX = eventPage('x', e) - this.startX
    const deltaY = eventPage('y', e) - this.startY

    if (deltaX > 0) {
      left = this.startX - offset.left
    } else {
      left = this.startX - offset.left + deltaX
    }
    if (deltaY > 0) {
      top = this.startY - offset.top
    } else {
      top = this.startY - offset.top + deltaY
    }

    this.updateSelectArea(left, top, Math.abs(deltaX), Math.abs(deltaY))
    this.emit('select')
  }
  private onDragEnd = () => {
    this.$selectArea.remove()
    this.emit('change')
    this.updateSelectArea(0, 0, 0, 0)
    $document.off(pointerEvent('move'), this.onDragMove)
    $document.off(pointerEvent('up'), this.onDragEnd)
  }
  private updateSelectArea(
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    const { container } = this
    const offset = this.$container.offset()
    this.$selectArea.css({
      left: left + container.scrollLeft,
      top: top + container.scrollTop,
      width,
      height,
    })
    this.left = left + offset.left
    this.top = top + offset.top
    this.bottom = top + height + offset.top
    this.right = left + width + offset.left
  }
  private bindEvent() {
    this.$container.on(pointerEvent('down'), this.onDragStart)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, DragSelector)
}
