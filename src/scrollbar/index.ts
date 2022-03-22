import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import clone from 'licia/clone'
import ResizeSensor from 'licia/ResizeSensor'
import { measuredScrollbarWidth, pxToNum, drag } from '../share/util'

const $document = $(document as any)

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
  private $xTrack: $.$
  private $yTrack: $.$
  private $xThumb: $.$
  private $yThumb: $.$
  private contentWrapper: HTMLElement
  private x: IScrollbar
  private y: IScrollbar
  private content: HTMLElement
  private resizeSensor: ResizeSensor
  private dragAxis: 'x' | 'y' = 'x'
  private dragOffset = 0
  constructor(container: HTMLElement) {
    super(container, { compName: 'scrollbar' })

    const childNodes = clone(container.childNodes)

    this.initTpl()
    this.$offset = this.find('.offset')
    const $content = this.find('.content')
    this.content = $content.get(0) as HTMLElement
    this.$contentWrapper = this.find('.content-wrapper')
    this.contentWrapper = this.$contentWrapper.get(0) as HTMLElement
    this.$yTrack = this.find('.vertical')
    this.$yThumb = this.find('.vertical .thumb')
    this.$xTrack = this.find('.horizontal')
    this.$xThumb = this.find('.horizontal .thumb')

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

    this.$xThumb.on(drag('start'), (e) => this.onDragStart(e, 'x'))
    this.$yThumb.on(drag('start'), (e) => this.onDragStart(e, 'y'))

    this.$contentWrapper.on('scroll', this.onScroll)
  }
  private onDragStart(e: any, axis: 'x' | 'y') {
    e = e.origEvent
    this.dragAxis = axis
    if (axis === 'x') {
      this.dragOffset = e.pageX - this.$xThumb.offset().left
    } else {
      this.dragOffset = e.pageY - this.$yThumb.offset().top
    }

    $document.on(drag('move'), this.onDragMove)
    $document.on(drag('end'), this.onDragEnd)
  }
  private onDragMove = (e: any) => {
    const { content, container, contentWrapper } = this

    if (this.dragAxis === 'x') {
    } else {
      const contentSize = content.scrollHeight
      const viewportSize = pxToNum(window.getComputedStyle(container).height)
      let dragPos = e.pageY - this.$yTrack.offset().top - this.dragOffset
      let scrollPos =
        (dragPos /
          (this.$yTrack.offset().height - this.$yThumb.offset().height)) *
        (contentSize - viewportSize)
      contentWrapper.scrollTop = scrollPos
    }
  }
  private onDragEnd = () => {
    $document.off(drag('move'), this.onDragMove)
    $document.off(drag('end'), this.onDragEnd)
  }
  private onScroll = () => {
    this.renderScrollbarX()
    this.renderScrollbarY()
  }
  private reset = () => {
    const { content, contentWrapper, $container, c, $xTrack, $yTrack } = this

    let xIsOverflow = content.scrollWidth > content.offsetWidth
    let yIsOverflow = content.scrollHeight > contentWrapper.offsetHeight
    if ($container.css('overflow-x') === 'hidden') {
      xIsOverflow = false
    }
    if ($container.css('overflow-y') === 'hidden') {
      yIsOverflow = false
    }

    this.x.isOverflow = xIsOverflow
    this.y.isOverflow = yIsOverflow

    if (xIsOverflow) {
      $xTrack.rmClass(c('hidden'))
    } else {
      $xTrack.addClass(c('hidden'))
    }
    if (yIsOverflow) {
      $yTrack.rmClass(c('hidden'))
    } else {
      $yTrack.addClass(c('hidden'))
    }

    this.$contentWrapper.css({
      overflowX: xIsOverflow ? 'scroll' : 'hidden',
      overflowY: yIsOverflow ? 'scroll' : 'hidden',
    })

    this.renderScrollbarX()
    this.renderScrollbarY()
    this.hideNativeScrollbar()
  }
  private renderScrollbarX() {
    const { $xTrack, content, $xThumb, contentWrapper, container } = this
    const trackSize = $xTrack.offset().width
    const contentSize = content.scrollWidth
    const viewportSize = pxToNum(window.getComputedStyle(container).width)
    const thumbSize = trackSize * (viewportSize / contentSize)

    const offset =
      ((trackSize - thumbSize) * contentWrapper.scrollLeft) /
      (contentSize - viewportSize)

    $xThumb.css({
      width: Math.round(thumbSize) + 'px',
      transform: `translate3d(${Math.round(offset)}px, 0, 0)`,
    })
  }
  private renderScrollbarY() {
    const { $yTrack, content, $yThumb, contentWrapper, container } = this
    const trackSize = $yTrack.offset().height
    const contentSize = content.scrollHeight
    const viewportSize = pxToNum(window.getComputedStyle(container).height)
    const thumbSize = trackSize * (viewportSize / contentSize)

    const offset =
      ((trackSize - thumbSize) * contentWrapper.scrollTop) /
      (contentSize - viewportSize)

    $yThumb.css({
      height: Math.round(thumbSize) + 'px',
      transform: `translate3d(0, ${Math.round(offset)}px, 0)`,
    })
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
