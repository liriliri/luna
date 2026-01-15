import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import clone from 'licia/clone'
import ResizeSensor from 'licia/ResizeSensor'
import pointerEvent from 'licia/pointerEvent'
import { measuredScrollbarWidth, exportCjs } from '../share/util'

const $document = $(document as any)

interface IScrollbar {
  isOverflow: boolean
}

export type IOptions = IComponentOptions

/**
 * Custom scrollbar.
 *
 * @example
 * const scrollbar = new LunaScrollbar(container)
 * scrollbar.getContent().innerHTML = 'test'
 */
export default class Scrollbar extends Component<IOptions> {
  private $offset: $.$
  private $contentWrapper: $.$
  private $xTrack: $.$
  private $yTrack: $.$
  private $xThumb: $.$
  private $yThumb: $.$
  private contentWrapper: HTMLElement
  private x: IScrollbar
  private y: IScrollbar
  private $content: $.$
  private content: HTMLElement
  private resizeSensor: ResizeSensor
  private contentResizeSensor: ResizeSensor
  private dragAxis: 'x' | 'y' = 'x'
  private dragOffset = 0
  private containerStyle: CSSStyleDeclaration
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'scrollbar' }, options)
    this.containerStyle = window.getComputedStyle(container)

    const childNodes = clone(container.childNodes)

    this.initTpl()
    this.$offset = this.find('.offset')
    this.$content = this.find('.content')
    this.content = this.$content.get(0) as HTMLElement
    this.$contentWrapper = this.find('.content-wrapper')
    this.contentWrapper = this.$contentWrapper.get(0) as HTMLElement
    this.$yTrack = this.find('.vertical')
    this.$yThumb = this.find('.vertical .thumb')
    this.$xTrack = this.find('.horizontal')
    this.$xThumb = this.find('.horizontal .thumb')

    each(childNodes, (child) => this.$content.append(child as Element))

    this.resizeSensor = new ResizeSensor(container)
    this.contentResizeSensor = new ResizeSensor(this.content)

    this.x = {
      isOverflow: false,
    }
    this.y = {
      isOverflow: false,
    }

    this.bindEvent()

    this.reset()
  }
  /** Get content element. */
  getContent() {
    return this.content
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.reset)
    this.contentResizeSensor.addListener(this.reset)

    this.$xThumb.on(pointerEvent('down'), (e) => this.onDragStart(e, 'x'))
    this.$yThumb.on(pointerEvent('down'), (e) => this.onDragStart(e, 'y'))

    this.$contentWrapper.on('scroll', this.onScroll)
  }
  private onDragStart(e: any, axis: 'x' | 'y') {
    e.preventDefault()
    e = e.origEvent

    const { c } = this
    this.dragAxis = axis
    if (axis === 'x') {
      this.dragOffset = e.pageX - this.$xThumb.offset().left
      this.$xTrack.addClass(c('active'))
    } else {
      this.dragOffset = e.pageY - this.$yThumb.offset().top
      this.$yTrack.addClass(c('active'))
    }

    $document.on(pointerEvent('move'), this.onDragMove)
    $document.on(pointerEvent('up'), this.onDragEnd)
  }
  private onDragMove = (e: any) => {
    e = e.origEvent
    const { content, contentWrapper, $yTrack, $xTrack, container } = this

    if (this.dragAxis === 'x') {
      const contentSize = content.scrollWidth
      const viewportSize = container.clientWidth
      const dragPos = e.pageX - $xTrack.offset().left - this.dragOffset
      const trackSize = $xTrack.offset().width
      const thumbSize = this.$xThumb.offset().width
      const dragPercentage = dragPos / (trackSize - thumbSize)
      const scrollPos = dragPercentage * (contentSize - viewportSize)
      contentWrapper.scrollLeft = scrollPos
    } else {
      const contentSize = content.scrollHeight
      const viewportSize = container.clientHeight
      const dragPos = e.pageY - $yTrack.offset().top - this.dragOffset
      const trackSize = $yTrack.offset().height
      const thumbSize = this.$yThumb.offset().height
      const dragPercentage = dragPos / (trackSize - thumbSize)
      const scrollPos = dragPercentage * (contentSize - viewportSize)
      contentWrapper.scrollTop = scrollPos
    }
  }
  private onDragEnd = () => {
    const { c, dragAxis } = this
    if (dragAxis === 'x') {
      this.$xTrack.rmClass(c('active'))
    } else {
      this.$yTrack.rmClass(c('active'))
    }

    $document.off(pointerEvent('move'), this.onDragMove)
    $document.off(pointerEvent('up'), this.onDragEnd)
  }
  private onScroll = () => {
    this.renderScrollbarX()
    this.renderScrollbarY()
  }
  private reset = () => {
    const {
      content,
      contentWrapper,
      $container,
      c,
      $xTrack,
      $yTrack,
      containerStyle,
    } = this

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

    const { paddingTop, paddingRight, paddingBottom, paddingLeft } =
      containerStyle

    this.$content.css({
      padding: `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`,
    })

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
    const viewportSize = container.clientWidth
    const thumbSize = Math.round(trackSize * (viewportSize / contentSize))

    const offset =
      ((trackSize - thumbSize) * contentWrapper.scrollLeft) /
      (contentSize - viewportSize)

    $xThumb.css({
      width: thumbSize + 'px',
      transform: `translate3d(${Math.round(offset)}px, 0, 0)`,
    })
  }
  private renderScrollbarY() {
    const { $yTrack, content, $yThumb, contentWrapper, container } = this
    const trackSize = $yTrack.offset().height
    const contentSize = content.scrollHeight
    const viewportSize = container.clientHeight
    const thumbSize = Math.round(trackSize * (viewportSize / contentSize))

    const offset =
      ((trackSize - thumbSize) * contentWrapper.scrollTop) /
      (contentSize - viewportSize)

    $yThumb.css({
      height: thumbSize + 'px',
      transform: `translate3d(0, ${Math.round(offset)}px, 0)`,
    })
  }
  private hideNativeScrollbar() {
    const { x, y, $offset } = this
    let scrollbarWidth = 0
    if (
      getComputedStyle(this.contentWrapper, '::-webkit-scrollbar').display !==
      'none'
    ) {
      scrollbarWidth = measuredScrollbarWidth()
    }

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

if (typeof module !== 'undefined') {
  exportCjs(module, Scrollbar)
}
