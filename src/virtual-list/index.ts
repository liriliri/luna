import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import throttle from 'licia/throttle'
import isHidden from 'licia/isHidden'
import now from 'licia/now'
import ResizeSensor from 'licia/ResizeSensor'
import isEmpty from 'licia/isEmpty'
import unique from 'licia/unique'
import map from 'licia/map'
import debounce from 'licia/debounce'
import each from 'licia/each'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Auto scroll if at bottom. */
  autoScroll?: boolean
}

/**
 * Vertical list with virtual scrolling.
 *
 * @example
 * const virtualList = new VirtualList(container, {
 *   autoScroll: true,
 * })
 * virtualList.append(document.createElement('div'))
 */
export default class VirtualList extends Component<IOptions> {
  private items: Item[] = []
  private $el: $.$
  private el: HTMLElement
  private $fakeEl: $.$
  private fakeEl: HTMLElement
  private $space: $.$
  private space: HTMLElement
  private spaceHeight = 0
  private topSpaceHeight = 0
  // @ts-ignore
  private bottomSpaceHeight = 0
  private lastScrollTop = 0
  private lastTimestamp = 0
  private speedToleranceFactor = 100
  private maxSpeedTolerance = 2000
  private minSpeedTolerance = 100
  private isAtBottom = true
  private updateTimer: NodeJS.Timeout | null = null
  private updateItems: Item[] = []
  private resizeSensor: ResizeSensor
  private scrollTimer: NodeJS.Timeout | null = null
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'virtual-list' }, options)

    this.initOptions(options, {
      autoScroll: false,
    })

    this.initTpl()

    this.$el = this.find('.items')
    this.el = this.$el.get(0) as HTMLElement
    this.$fakeEl = this.find('.fake-items')
    this.fakeEl = this.$fakeEl.get(0) as HTMLElement
    this.$space = this.find('.items-space')
    this.space = this.$space.get(0) as HTMLElement

    this.resizeSensor = new ResizeSensor(this.space)

    this.bindEvent()
  }
  clear() {
    this.items = []
    this.render()
  }
  append(el: HTMLElement) {
    const item = new Item(el, this.el)
    this.items.push(item)
    this.updateSize(item)
  }
  setItems(els: HTMLElement[]) {
    each(this.items, (item) => item.destroy())
    this.items = map(els, (el) => new Item(el, this.el))
    this.updateItems = []
    this.updateAllSize()
  }
  private updateAllSize = debounce(() => {
    this.updateItems.push(...this.items)
    this.updateItems = unique(this.updateItems)
    if (!this.updateTimer) {
      this._updateSize()
    }
  }, 1000)
  private updateSize(item: Item) {
    this.updateItems.push(item)
    if (!this.updateTimer) {
      this._updateSize()
    }
  }
  private _updateSize = () => {
    const items = this.updateItems.splice(0, 1000)
    if (isEmpty(items)) {
      return
    }

    const len = items.length
    const { fakeEl } = this
    const fakeFrag = document.createDocumentFragment()
    for (let i = 0; i < len; i++) {
      fakeFrag.appendChild(items[i].el)
    }
    fakeEl.appendChild(fakeFrag)
    for (let i = 0; i < len; i++) {
      items[i].updateSize()
    }
    fakeEl.textContent = ''

    this.render()

    if (!isEmpty(this.updateItems)) {
      this.updateTimer = setTimeout(() => this._updateSize(), 100)
    } else {
      this.updateTimer = null
    }
  }
  private initTpl() {
    this.$container.html(
      this.c(
        '<div class="items-space"><div class="fake-items"></div><div class="items"></div></div>'
      )
    )
  }
  private updateTopSpace(height: number) {
    this.topSpaceHeight = height
    this.el.style.top = height + 'px'
  }
  private updateBottomSpace(height: number) {
    this.bottomSpaceHeight = height
  }
  private updateSpace(height: number) {
    if (this.spaceHeight === height) return
    this.spaceHeight = height
    this.space.style.height = height + 'px'
  }
  private bindEvent() {
    this.resizeSensor.addListener(
      throttle(() => {
        this.updateAllSize()
      }, 100)
    )
    this.$container.on('scroll', this.onScroll)
  }
  private render = throttle(
    ({ topTolerance = 500, bottomTolerance = 500 } = {}) => {
      const { el, container } = this
      if (isHidden(container)) {
        return
      }

      const { scrollTop, offsetHeight } = container as HTMLElement
      const top = scrollTop - topTolerance
      const bottom = scrollTop + offsetHeight + bottomTolerance

      const { items } = this

      let topSpaceHeight = 0
      let bottomSpaceHeight = 0
      let currentHeight = 0

      const len = items.length

      const frag = document.createDocumentFragment()
      for (let i = 0; i < len; i++) {
        const item = items[i]
        const { el, height } = item

        if (currentHeight > bottom) {
          bottomSpaceHeight += height
        } else if (currentHeight + height > top) {
          frag.appendChild(el)
        } else if (currentHeight < top) {
          topSpaceHeight += height
        }

        currentHeight += height
      }

      this.updateSpace(currentHeight)
      this.updateTopSpace(topSpaceHeight)
      this.updateBottomSpace(bottomSpaceHeight)

      el.textContent = ''
      el.appendChild(frag)

      if (this.options.autoScroll) {
        const { scrollHeight } = container
        if (this.isAtBottom && scrollTop <= scrollHeight - offsetHeight) {
          container.scrollTop = 10000000
        }
      }
    },
    16
  )
  private onScroll = () => {
    const { scrollHeight, offsetHeight, scrollTop } = this
      .container as HTMLElement
    // safari bounce effect
    if (scrollTop <= 0) return
    if (offsetHeight + scrollTop > scrollHeight) return

    let isAtBottom = false
    if (scrollHeight === offsetHeight) {
      isAtBottom = true
    } else if (Math.abs(scrollHeight - offsetHeight - scrollTop) < 1) {
      isAtBottom = true
    }
    this.isAtBottom = isAtBottom

    const lastScrollTop = this.lastScrollTop
    const lastTimestamp = this.lastTimestamp

    const timestamp = now()
    const duration = timestamp - lastTimestamp
    const distance = scrollTop - lastScrollTop
    const speed = Math.abs(distance / duration)
    let speedTolerance = speed * this.speedToleranceFactor
    if (duration > 1000) {
      speedTolerance = 1000
    }
    if (speedTolerance > this.maxSpeedTolerance) {
      speedTolerance = this.maxSpeedTolerance
    }
    if (speedTolerance < this.minSpeedTolerance) {
      speedTolerance = this.minSpeedTolerance
    }
    this.lastScrollTop = scrollTop
    this.lastTimestamp = timestamp

    let topTolerance = 0
    let bottomTolerance = 0
    if (lastScrollTop < scrollTop) {
      topTolerance = this.minSpeedTolerance
      bottomTolerance = speedTolerance
    } else {
      topTolerance = speedTolerance
      bottomTolerance = this.minSpeedTolerance
    }

    if (
      this.topSpaceHeight < scrollTop - topTolerance &&
      this.topSpaceHeight + this.el.offsetHeight >
        scrollTop + offsetHeight + bottomTolerance
    ) {
      return
    }

    this.render({
      topTolerance: topTolerance * 2,
      bottomTolerance: bottomTolerance * 2,
    })

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    this.scrollTimer = setTimeout(() => {
      this.render()
    }, 100)
  }
}

class Item {
  el: HTMLElement
  width: number
  height: number
  private resizeSensor: ResizeSensor
  constructor(el: HTMLElement, container: HTMLElement) {
    this.el = el
    this.width = 0
    this.height = 0

    this.resizeSensor = new ResizeSensor(el)
    this.resizeSensor.addListener(() => {
      if (el.parentNode === container && !isHidden(el)) {
        this.updateSize()
      }
    })
  }
  destroy() {
    this.resizeSensor.destroy()
  }
  updateSize() {
    const { width, height } = this.el.getBoundingClientRect()
    this.width = width
    this.height = height
  }
}
