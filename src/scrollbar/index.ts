import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import clone from 'licia/clone'
import ResizeSensor from 'licia/ResizeSensor'
import { measuredScrollbarWidth } from '../share/util'

interface IScrollbar {
  isOverflow: boolean
}

/**
 * Custom scrollbar.
 *
 * @example
 * const scrollbar = new LunaScrollbar(container)
 */
export default class Scrollbar extends Component {
  private $offset: $.$
  private $contentWrapper: $.$
  private contentWrapper: HTMLElement
  private x: IScrollbar
  private y: IScrollbar
  private content: HTMLElement
  private resizeSensor: ResizeSensor
  constructor(container: HTMLElement) {
    super(container, { compName: 'scrollbar' })

    const childNodes = clone(container.childNodes)
    this.initTpl()
    this.$offset = this.find('.offset')
    const $content = this.find('.content')
    this.content = $content.get(0) as HTMLElement
    this.$contentWrapper = this.find('.content-wrapper')
    this.contentWrapper = this.$contentWrapper.get(0) as HTMLElement
    each(childNodes, (child) => $content.append(child as Element))

    this.resizeSensor = new ResizeSensor(container)

    this.x = {
      isOverflow: false,
    }
    this.y = {
      isOverflow: false,
    }

    this.bindEvent()

    this.reset()
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.reset)
  }
  private reset = () => {
    const { content, contentWrapper } = this

    this.x.isOverflow = content.scrollWidth > content.offsetWidth
    this.y.isOverflow = content.scrollHeight > contentWrapper.offsetHeight

    this.$contentWrapper.css({
      overflow: 'auto',
      height: '100%',
      width: '100%',
    })

    this.hideNativeScrollbar()
  }
  private hideNativeScrollbar() {
    const { x, y, $offset } = this
    const scrollbarWidth = measuredScrollbarWidth()

    $offset.css({
      right: y.isOverflow ? -scrollbarWidth : 0,
      bottom: x.isOverflow ? -scrollbarWidth : 0,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="wrapper">
        <div class="offset">
          <div class="content-wrapper">
            <div class="content"></div>
          </div>
        </div>
      </div>
      <div class="track horizontal">
        <div class="thumb"></div>
      </div>
      <div class="track vertical">
        <div class="thumb"></div>
      </div>
      `)
    )
  }
}

module.exports = Scrollbar
module.exports.default = Scrollbar
