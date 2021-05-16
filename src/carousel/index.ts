import isStr from 'licia/isStr'
import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import Component from '../share/Component'

export default class Carousel extends Component {
  private slides: HTMLElement[] = []
  constructor(container: HTMLElement) {
    super(container, { compName: 'carousel' })

    this.initTpl()
  }
  append(content: string | HTMLElement) {
    this.insert(this.slides.length, content)
  }
  insert(pos: number, content: string | HTMLElement) {
    if (isStr(content)) {
      content = toEl(content as string) as HTMLElement
    }
    this.slides.splice(pos, 0, content as HTMLElement)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
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
