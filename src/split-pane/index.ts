import Component, { IComponentOptions } from '../share/Component'
import { eventClient, exportCjs, pxToNum } from '../share/util'
import $ from 'licia/$'
import defaults from 'licia/defaults'
import last from 'licia/last'
import throttle from 'licia/throttle'
import toEl from 'licia/toEl'
import ResizeSensor from 'licia/ResizeSensor'
import pointerEvent from 'licia/pointerEvent'
import min from 'licia/min'
import max from 'licia/max'
import clamp from 'licia/clamp'
import map from 'licia/map'
import extend from 'licia/extend'
import find from 'licia/find'
import isUndef from 'licia/isUndef'
import filter from 'licia/filter'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Direction to split. */
  direction?: 'horizontal' | 'vertical'
}

export interface IElOptions {
  minSize?: number
  weight?: number
  visible?: boolean
}

interface IElement extends Required<IElOptions> {
  el: HTMLElement
  $el: $.$
  resizer?: HTMLElement
  $resizer?: $.$
  size: number
}

/**
 * A component for creating resizable split panes.
 *
 * @example
 * const splitPane = new SplitPane(container, {
 *   direction: 'horizontal', // or 'vertical',
 * })
 * splitPane.append(document.createElement('div'), {
 *   minSize: 100,
 *   weight: 50,
 * })
 */
export default class SplitPane extends Component<IOptions> {
  private elements: IElement[] = []
  private displayElements: IElement[] = []
  private onResize: () => void
  private resizeSensor: ResizeSensor
  private isHorizontal: boolean
  private resizeIdx = 0
  private resizeStart = 0
  private resizeStartPos = 0
  private resizeDelta = 0
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'split-pane' }, options)

    this.initOptions(options, {
      direction: 'horizontal',
    })
    const { direction } = this.options
    this.isHorizontal = direction === 'horizontal'
    this.$container.addClass(this.c(direction))

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this.applyWeights(), 16)

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  /** Append an element. */
  append(el: HTMLElement, options: IElOptions = {}) {
    const { $container, elements } = this

    defaults(options, {
      minSize: 24,
      visible: true,
    })
    const lastEl = last(elements)
    if (!options.weight) {
      if (lastEl) {
        lastEl.weight = lastEl.weight / 2
        options.weight = lastEl.weight
      } else {
        options.weight = 100
      }
    }

    if (elements.length > 0) {
      const resizer = toEl(
        this.c(`<div class="resizer" data-idx="${elements.length - 1}"></div>`)
      )
      $container.append(resizer)
      lastEl.resizer = resizer
      lastEl.$resizer = $(resizer)
      const self = this
      const idx = elements.length - 1
      lastEl.$resizer.on(pointerEvent('down'), function (e: any) {
        self.resizeIdx = idx
        self.onResizeStart(e)
      })
    }
    $container.append(el)

    const $el = $(el)
    const item = {
      el,
      $el,
      size: 0,
      ...(options as Required<IElOptions>),
    }
    elements.push(item)

    this.updateDisplayElements()
    this.applyWeights()
  }
  /** Update an element's options. */
  update(el: HTMLElement, options: IElOptions) {
    const item = find(this.elements, (item) => item.el === el)
    if (item) {
      extend(item, options)
      if (!isUndef(options.visible)) {
        this.updateDisplayElements()
      }
      this.applyWeights()
    }
  }
  private updateDisplayElements() {
    this.displayElements = filter(this.elements, (item) => {
      if (item.visible) {
        item.$el.rmClass(this.c('hidden'))
        item.$resizer?.rmClass(this.c('hidden'))
      } else {
        item.$el.addClass(this.c('hidden'))
        item.$resizer?.addClass(this.c('hidden'))
      }

      return item.visible
    })
  }
  private onResizeStart(e: any) {
    const { displayElements, isHorizontal } = this

    e.stopPropagation()
    e.preventDefault()
    e = e.origEvent

    const item = displayElements[this.resizeIdx]
    this.resizeStart = eventClient(isHorizontal ? 'x' : 'y', e)
    this.resizeStartPos = pxToNum(
      item.$resizer!.css(isHorizontal ? 'left' : 'top')
    )

    $(document.body).addClass(this.c(`resizing-${this.options.direction}`))
    $document.on(pointerEvent('move'), this.onResizeMove)
    $document.on(pointerEvent('up'), this.onResizeEnd)
  }
  private onResizeMove = (e: any) => {
    const { resizeIdx, isHorizontal, displayElements } = this
    e = e.origEvent

    let delta = eventClient(isHorizontal ? 'x' : 'y', e) - this.resizeStart
    const leftItem = displayElements[resizeIdx]
    const rightItem = displayElements[resizeIdx + 1]
    const lowerBound = min(-leftItem.size + leftItem.minSize, 0)
    const upperBound = max(rightItem.size - rightItem.minSize, 0)
    delta = clamp(delta, lowerBound, upperBound)
    leftItem.$el.css(
      isHorizontal ? 'width' : 'height',
      leftItem.size + delta + 'px'
    )
    rightItem.$el.css(
      isHorizontal ? 'width' : 'height',
      rightItem.size - delta + 'px'
    )
    this.resizeDelta = delta
    const newPos = this.resizeStartPos + delta

    leftItem.$resizer!.css(isHorizontal ? 'left' : 'top', newPos + 'px')
  }
  private onResizeEnd = (e: any) => {
    this.onResizeMove(e)

    const { displayElements, resizeIdx, resizeDelta } = this
    const leftItem = displayElements[resizeIdx]
    const rightItem = displayElements[resizeIdx + 1]

    const leftWidth = leftItem.size + resizeDelta
    const rightWidth = rightItem.size - resizeDelta
    const totalWidth = leftWidth + rightWidth
    const totalWeight =
      (leftItem.weight as number) + (rightItem.weight as number)
    const leftWeight = totalWeight * (leftWidth / totalWidth)
    const rightWeight = totalWeight - leftWeight
    leftItem.weight = leftWeight
    rightItem.weight = rightWeight
    this.applyWeights()
    this.emit(
      'resize',
      map(this.elements, (item) => item.weight)
    )

    $(document.body).rmClass(this.c(`resizing-${this.options.direction}`))
    $document.off(pointerEvent('move'), this.onResizeMove)
    $document.off(pointerEvent('up'), this.onResizeEnd)
  }
  private applyWeights() {
    const { displayElements, isHorizontal } = this

    let sumOfWeights = 0
    const len = displayElements.length
    for (let i = 0; i < len; i++) {
      sumOfWeights += displayElements[i].weight
    }

    let sum = 0
    let lastOffset = 0
    const containerOffset = this.$container.offset()
    const containerSize = isHorizontal
      ? containerOffset.width
      : containerOffset.height
    for (let i = 0; i < len; i++) {
      const item = displayElements[i]
      sum += item.weight
      let offset = ((sum * containerSize) / sumOfWeights) | 0
      let size = offset - lastOffset
      if (size < item.minSize) {
        size = item.minSize
        offset = lastOffset + size
      }
      lastOffset = offset
      if (isHorizontal) {
        item.$el.css('width', size + 'px')
      } else {
        item.$el.css('height', size + 'px')
      }
      item.size = size
    }

    this.positionResizers()
  }
  private positionResizers() {
    const { elements, isHorizontal } = this

    const pos: number[] = []
    for (let i = 0, len = elements.length - 1; i < len; i++) {
      const item = elements[i]
      pos[i] = (pos[i - 1] || 0) + item.size
      item.$resizer!.css(isHorizontal ? 'left' : 'top', pos[i] + 'px')
    }
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, SplitPane)
}
