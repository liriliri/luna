import isStr from 'licia/isStr'
import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import Component from '../share/Component'
import $ from 'licia/$'
import toArr from 'licia/toArr'
import h from 'licia/h'
import idxOf from 'licia/idxOf'
import { executeAfterTransition } from '../share/util'

export default class Carousel extends Component {
  private $body: $.$
  private $arrowLeft: $.$
  private $arrowRight: $.$
  private body: HTMLElement
  constructor(container: HTMLElement) {
    super(container, { compName: 'carousel' })

    this.initTpl()

    this.$body = this.find('.body')
    this.body = this.$body.get(0) as HTMLElement
    this.$arrowLeft = this.find('.arrow-left')
    this.$arrowRight = this.find('.arrow-right')

    this.bindEvent()
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
  }
  next = () => {
    this.slide('next')
  }
  prev = () => {
    this.slide('prev')
  }
  private slide(order: string) {
    const isNext = order === 'next'
    const slides = this.getSlides()
    const len = slides.length

    const $activeEl = this.find('.active')
    const activeEl = $activeEl.get(0) as HTMLElement
    const activeIdx = idxOf(slides, activeEl)
    let nextIdx = isNext ? activeIdx + 1 : activeIdx - 1
    if (nextIdx >= len) {
      nextIdx = 0
    } else if (nextIdx < 0) {
      nextIdx = len - 1
    }
    const nextEl = slides[nextIdx]
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
    })
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
    `)
    )
  }
  private bindEvent() {
    this.$arrowLeft.on('click', this.prev)
    this.$arrowRight.on('click', this.next)
  }
}

module.exports = Carousel
module.exports.default = Carousel
