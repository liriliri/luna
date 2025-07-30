import isStr from 'licia/isStr'
import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import toArr from 'licia/toArr'
import h from 'licia/h'
import idxOf from 'licia/idxOf'
import toNum from 'licia/toNum'
import { executeAfterTransition, exportCjs } from '../share/util'
import isUndef from 'licia/isUndef'
import toBool from 'licia/toBool'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Time between automatically cycling. */
  interval?: number
}

/**
 * Lightweight carousel.
 *
 * @example
 * const container = document.getElementById('container')
 * const carousel = new LunaCarousel(container, { interval: 5000 })
 * carousel.append('<div style="background:#e73c5e;">ITEM 1</div>')
 */
export default class Carousel extends Component<IOptions> {
  private $body: $.$
  private $arrowLeft: $.$
  private $arrowRight: $.$
  private $indicators: $.$
  private body: HTMLElement
  private activeIdx = -1
  private interval: ReturnType<typeof setInterval> | null = null
  private isSliding = false
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'carousel' }, options)

    this.initTpl()

    this.initOptions(options, {
      interval: 0,
    })

    this.$body = this.find('.body')
    this.body = this.$body.get(0) as HTMLElement
    this.$arrowLeft = this.find('.arrow-left')
    this.$arrowRight = this.find('.arrow-right')
    this.$indicators = this.find('.indicators').find('ul')

    this.bindEvent()

    this.cycle()
  }
  /** Cycle through the carousel items. */
  cycle() {
    if (this.options.interval <= 0) {
      return
    }

    this.pause()

    this.interval = setInterval(this.next, this.options.interval)
  }
  /** Stop cycling. */
  pause() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
  /** Slide to the item at given index. */
  slideTo(idx: number) {
    this.slide(idx > this.activeIdx ? 'next' : 'prev', idx)
  }
  /** Clear all items. */
  clear() {
    this.activeIdx = -1
    this.body.innerHTML = ''
    this.updateIndicators()
  }
  /** Append item. */
  append(content: string | HTMLElement) {
    const slides = this.getSlides()
    this.insert(slides.length, content)
  }
  /** Insert item at given position. */
  insert(pos: number, content: string | HTMLElement) {
    const slides = this.getSlides()
    const len = slides.length
    if (len === 0) {
      this.activeIdx = 0
    }

    const item = h(this.c('.item') + this.c(len === 0 ? '.active' : ''))
    if (isStr(content)) {
      content = toEl(content as string) as HTMLElement
    }

    item.appendChild(content as HTMLElement)
    if (pos > len - 1) {
      this.body.appendChild(item)
    } else {
      const nextEl = slides[pos]
      this.body.insertBefore(item, nextEl)
    }

    this.updateIndicators()
  }
  /** Slide to the next item. */
  next = () => {
    this.slide('next')
  }
  /** Slide to the previous item. */
  prev = () => {
    this.slide('prev')
  }
  /** Get current index, starting from 0, -1 means no items. */
  getActiveIdx() {
    return this.activeIdx
  }
  destroy() {
    this.pause()
    super.destroy()
  }
  getSlides() {
    return toArr(this.body.children)
  }
  private slide(order: string, nextIdx?: number) {
    if (this.isSliding) {
      return
    }

    const isNext = order === 'next'
    const slides = this.getSlides()
    const len = slides.length

    if (len === 0) {
      return
    }

    const $activeEl = this.find('.active')
    const activeEl = $activeEl.get(0) as HTMLElement
    const activeIdx = idxOf(slides, activeEl)

    let nextEl: HTMLElement

    if (!isUndef(nextIdx)) {
      nextEl = slides[nextIdx as number]
    } else {
      nextIdx = isNext ? activeIdx + 1 : activeIdx - 1
      if (nextIdx >= len) {
        nextIdx = 0
      } else if (nextIdx < 0) {
        nextIdx = len - 1
      }
      nextEl = slides[nextIdx]
    }

    if (nextIdx! >= len || nextIdx! < 0) {
      return
    }
    if (activeIdx === nextIdx) {
      return
    }

    const isCycling = toBool(this.interval)
    if (isCycling) {
      this.pause()
    }
    this.isSliding = true

    const $nextEl = $(nextEl)

    const directionClass = this.c(isNext ? 'item-start' : 'item-end')
    const orderClass = this.c(isNext ? 'item-next' : 'item-prev')
    const activeClass = this.c('active')

    $nextEl.addClass(orderClass)
    void nextEl.offsetHeight
    $activeEl.addClass(directionClass)
    $nextEl.addClass(directionClass)

    executeAfterTransition(activeEl, () => {
      $nextEl.rmClass(orderClass)
      $nextEl.rmClass(directionClass)
      $nextEl.addClass(activeClass)

      $activeEl.rmClass(directionClass)
      $activeEl.rmClass(activeClass)

      this.isSliding = false
      this.emit('slide')
      if (isCycling) {
        this.cycle()
      }
    })

    this.activeIdx = nextIdx!
    this.updateIndicators()
  }
  private updateIndicators() {
    const { c, activeIdx } = this
    const slides = this.getSlides()
    const len = slides.length

    let html = ''
    for (let i = 0; i < len; i++) {
      html += `<li class="${c(
        'indicator ' + (activeIdx === i ? 'active' : '')
      )}" data-idx="${i}"></li>`
    }

    this.$indicators.html(html)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body"></div>
      <div class="arrow-left">
        <span class="icon icon-left"></span>
      </div>
      <div class="arrow-right">
        <span class="icon icon-right"></span>
      </div>
      <div class="indicators"><ul></ul></div>
    `)
    )
  }
  private bindEvent() {
    this.$arrowLeft.on('click', this.prev)
    this.$arrowRight.on('click', this.next)

    const self = this
    this.$indicators.on('click', 'li', function (this: any) {
      const $this = $(this)
      const idx = toNum($this.data('idx'))
      self.slideTo(idx)
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Carousel)
}
