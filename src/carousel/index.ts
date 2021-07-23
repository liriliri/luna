import isStr from 'licia/isStr'
import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import Component from '../share/Component'
import $ from 'licia/$'
import toArr from 'licia/toArr'
import h from 'licia/h'
import idxOf from 'licia/idxOf'
import toNum from 'licia/toNum'
import { executeAfterTransition } from '../share/util'
import isUndef from 'licia/isUndef'
import toBool from 'licia/toBool'

interface IOptions {
  interval?: number
}

export default class Carousel extends Component<IOptions> {
  private $body: $.$
  private $arrowLeft: $.$
  private $arrowRight: $.$
  private $indicators: $.$
  private body: HTMLElement
  private activeIdx = 0
  private interval: ReturnType<typeof setInterval> | null = null
  private isSliding = false
  constructor(container: HTMLElement, { interval = 0 }: IOptions = {}) {
    super(container, { compName: 'carousel' })

    this.initTpl()

    this.options = {
      interval,
    }

    this.$body = this.find('.body')
    this.body = this.$body.get(0) as HTMLElement
    this.$arrowLeft = this.find('.arrow-left')
    this.$arrowRight = this.find('.arrow-right')
    this.$indicators = this.find('.indicators').find('ul')

    this.bindEvent()

    this.cycle()
  }
  cycle() {
    if (this.options.interval <= 0) {
      return
    }

    this.pause()

    this.interval = setInterval(this.next, this.options.interval)
  }
  pause() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
  slideTo(idx: number) {
    this.slide(idx > this.activeIdx ? 'next' : 'prev', idx)
  }
  append(content: string | HTMLElement) {
    const slides = this.getSlides()
    this.insert(slides.length, content)
  }
  insert(pos: number, content: string | HTMLElement) {
    const slides = this.getSlides()
    const len = slides.length

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
  next = () => {
    this.slide('next')
  }
  prev = () => {
    this.slide('prev')
  }
  destroy() {
    this.pause()
    super.destroy()
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
  private getSlides() {
    return toArr(this.body.children)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body"></div>
      <div class="arrow-left">
        <span class="icon icon-arrow-left"></span>
      </div>
      <div class="arrow-right">
        <span class="icon icon-arrow-right"></span>
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

module.exports = Carousel
module.exports.default = Carousel
