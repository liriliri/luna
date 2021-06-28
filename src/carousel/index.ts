import isStr from 'licia/isStr'
import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import Component from '../share/Component'
import $ from 'licia/$'
import toArr from 'licia/toArr'
import h from 'licia/h'

export default class Carousel extends Component {
  private $body: $.$
  private body: HTMLElement
  constructor(container: HTMLElement) {
    super(container, { compName: 'carousel' })

    this.initTpl()

    this.$body = this.find('.body')
    this.body = this.$body.get(0) as HTMLElement
  }
  append(content: string | HTMLElement) {
    const slides = this.getSlides()
    this.insert(slides.length, content)
  }
  insert(pos: number, content: string | HTMLElement) {
    const item = h(this.c('.item'))
    if (isStr(content)) {
      content = toEl(content as string) as HTMLElement
    }
    item.appendChild(content as HTMLElement)
    const slides = this.getSlides()
    const len = slides.length
    if (pos > len - 1) {
      this.body.appendChild(item)
    } else {
      const nextEl = slides[pos]
      this.body.insertBefore(item, nextEl)
    }
  }
  private getSlides() {
    return toArr(this.body.children)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body"></body>
      <div class="arrow-left">
        <span class="icon icon-arrow-left"></span>
      </div>
      <div class="arrow-right">
        <span class="icon icon-arrow-right"></span>
      </div>
    `)
    )
  }
}

module.exports = Carousel
module.exports.default = Carousel
