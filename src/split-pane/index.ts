import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import $ from 'licia/$'
import defaults from 'licia/defaults'
import last from 'licia/last'
import throttle from 'licia/throttle'
import ResizeSensor from 'licia/ResizeSensor'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Direction to split. */
  direction?: 'horizontal' | 'vertical'
}

interface IElOptions {
  minSize?: number
  weight?: number
}

interface IElement extends Required<IElOptions> {
  el: HTMLElement
  $el: $.$
  size: number
}

/**
 * A component for creating resizable split panes.
 *
 * @example
 * const splitPane = new SplitPane(container, {})
 */
export default class SplitPane extends Component<IOptions> {
  private elements: IElement[] = []
  private onResize: () => void
  private resizeSensor: ResizeSensor
  private isHorizontal: boolean
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'split-pane' }, options)

    this.initOptions(options, {
      direction: 'horizontal',
    })
    this.isHorizontal = this.options.direction === 'horizontal'
    this.$container.css('flex-direction', this.isHorizontal ? 'row' : 'column')

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
    })
    if (!options.weight) {
      const lastEl = last(elements)
      if (lastEl) {
        lastEl.weight = lastEl.weight / 2
        options.weight = lastEl.weight
      } else {
        options.weight = 100
      }
    }

    if (elements.length > 0) {
      $container.append(
        this.c(`<div class="resizer" data-idx="${elements.length - 1}"></div>`)
      )
    }
    $container.append(el)

    const $el = $(el)
    elements.push({
      el,
      $el,
      size: 0,
      ...(options as Required<IElOptions>),
    })

    this.applyWeights()
  }
  private applyWeights() {
    const { elements, isHorizontal } = this

    let sumOfWeights = 0
    const len = elements.length
    for (let i = 0; i < len; i++) {
      sumOfWeights += elements[i].weight
    }

    let sum = 0
    let lastOffset = 0
    const containerOffset = this.$container.offset()
    const containerSize = isHorizontal
      ? containerOffset.width
      : containerOffset.height
    for (let i = 0; i < len; i++) {
      const item = elements[i]
      sum += item.weight
      const offset = ((sum * containerSize) / sumOfWeights) | 0
      const size = Math.max(offset - lastOffset, item.minSize)
      lastOffset = offset
      if (isHorizontal) {
        item.el.style.width = `${size}px`
      } else {
        item.el.style.height = `${size}px`
      }
      item.size = size
    }
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, SplitPane)
}
