import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import throttle from 'licia/throttle'
import isHidden from 'licia/isHidden'
import now from 'licia/now'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import clone from 'licia/clone'
import some from 'licia/some'

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
  private spaceWidth = 0
  private topSpaceHeight = 0
  private lastScrollTop = 0
  private lastTimestamp = 0
  private speedToleranceFactor = 100
  private maxSpeedTolerance = 2000
  private minSpeedTolerance = 100
  private isAtBottom = true
  private updateTimer: NodeJS.Timeout | null = null
  private updateItems: Item[] = []
  private displayItems: Item[] = []
  private hasScrollbar = false
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

    this.bindEvent()
  }
  /** Clear all items. */
  clear() {
    this.reset()
    this.render()
  }
  /** Append item. */
  append(el: HTMLElement) {
    const item: Item = (el as any).virtualListItem || new Item(el)
    this.items.push(item)
    this.update(el)
  }
  /** Set items. */
  setItems(elements: HTMLElement[]) {
    this.reset()
    each(elements, (el) => this.append(el))
  }
  /** Remove item. */
  remove(el: HTMLElement) {
    const item = (el as any).virtualListItem
    if (!item) {
      return
    }
    const idx = this.items.indexOf(item)
    if (idx === -1) {
      return
    }
    this.items.splice(idx, 1)
    item.destroy()
    this.render()
  }
  /** Scroll to end. */
  scrollToEnd() {
    const { container } = this
    const { scrollTop, scrollHeight, clientHeight } = container
    if (scrollTop <= scrollHeight - clientHeight) {
      container.scrollTop = 10000000
      this.render()
    }
  }
  /** Update heights. */
  update(el?: HTMLElement) {
    if (el) {
      this.updateItems.push((el as any).virtualListItem)
    } else {
      this.updateItems = clone(this.items)
    }
    if (!this.updateTimer) {
      this._update()
    }
  }
  private reset() {
    this.items = []
    this.updateItems = []
    this.displayItems = []
    this.isAtBottom = true
    this.hasScrollbar = false
    this.lastScrollTop = 0
    this.lastTimestamp = 0
  }
  private _update = () => {
    const items = this.updateItems.splice(0, 1000)
    if (isEmpty(items)) {
      return
    }

    const len = items.length
    const { fakeEl } = this
    const fakeFrag = document.createDocumentFragment()
    for (let i = 0; i < len; i++) {
      const item = items[i]
      if (item.el.parentNode === this.el) {
        item.update()
      } else {
        fakeFrag.appendChild(item.el)
      }
    }
    fakeEl.appendChild(fakeFrag)
    for (let i = 0; i < len; i++) {
      items[i].update()
    }
    fakeEl.textContent = ''

    this.render()

    if (!isEmpty(this.updateItems)) {
      this.updateTimer = setTimeout(() => this._update(), 16)
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
  private updateSpace(height: number, width: number) {
    if (this.spaceHeight === height && this.spaceWidth === width) {
      return
    }
    this.spaceHeight = height
    this.spaceWidth = width
    this.space.style.height = height + 'px'
    this.space.style.width = width + 'px'
  }
  private bindEvent() {
    this.$container
      .on('scroll', this.onScroll)
      .on('click', () => (this.isAtBottom = false))
  }
  private render = throttle(
    ({ topTolerance = 500, bottomTolerance = 500 } = {}) => {
      const { el, container } = this
      if (isHidden(container)) {
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = container as HTMLElement
      const top = scrollTop - topTolerance
      const bottom = scrollTop + clientHeight + bottomTolerance

      const { items } = this

      let topSpaceHeight = 0
      let currentHeight = 0
      let currentWidth = 0

      const len = items.length

      const displayItems = []
      for (let i = 0; i < len; i++) {
        const item = items[i]
        const { height, width } = item

        if (currentHeight <= bottom) {
          if (currentHeight + height > top) {
            displayItems.push(item)
          } else if (currentHeight < top) {
            topSpaceHeight += height
          }
        }

        currentHeight += height

        if (currentWidth < width) {
          currentWidth = width
        }
      }

      this.updateSpace(currentHeight, currentWidth)
      this.updateTopSpace(topSpaceHeight)

      if (
        len > 0 &&
        !some(displayItems, (item, idx) => item !== this.displayItems[idx])
      ) {
        return
      }
      this.displayItems = displayItems

      const frag = document.createDocumentFragment()
      for (let i = 0, len = displayItems.length; i < len; i++) {
        frag.appendChild(displayItems[i].el)
      }

      el.textContent = ''
      el.appendChild(frag)

      if (this.options.autoScroll && this.isAtBottom) {
        this.scrollToEnd()
      }

      const hasScrollbar = scrollHeight > clientHeight
      if (this.hasScrollbar !== hasScrollbar) {
        this.hasScrollbar = hasScrollbar
        this.update()
      }
    },
    16
  )
  private onScroll = () => {
    const { scrollHeight, clientHeight, scrollTop } = this
      .container as HTMLElement
    // safari bounce effect
    if (scrollTop <= 0) return
    if (clientHeight + scrollTop > scrollHeight) return

    let isAtBottom = false
    if (scrollHeight === clientHeight) {
      isAtBottom = true
    } else if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
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
        scrollTop + clientHeight + bottomTolerance
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
  constructor(el: HTMLElement) {
    this.el = el
    ;(el as any).virtualListItem = this
    this.width = 0
    this.height = 0
  }
  destroy() {
    delete (this.el as any).virtualListItem
  }
  update() {
    const { width, height } = this.el.getBoundingClientRect()
    this.width = width
    this.height = height
  }
}
