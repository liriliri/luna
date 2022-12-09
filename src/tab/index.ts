import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import escape from 'licia/escape'
import isNum from 'licia/isNum'
import { measuredScrollbarWidth, exportCjs } from '../share/util'

/** ITab */
export interface ITab {
  /** Tab id. */
  id: string
  /** Tab title. */
  title: string
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Tab height. */
  height?: number
}

/**
 * Easy tabs.
 *
 * @example
 * const container = document.getElementById('container')
 * const tab = new LunaTabs(container, {
 *   height: 30,
 * })
 * tab.append({
 *   id: 'console',
 *   title: 'Console',
 * })
 * tab.select('console')
 * tab.on('select', id => {
 *   console.log(id)
 * })
 */
export default class Tab extends Component<IOptions> {
  private $tabs: $.$
  private tabs: HTMLElement
  private $slider: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'tab' }, options)

    this.initOptions(options, {
      height: 30,
    })

    this.initTpl()
    this.find('.tabs-container').css('height', this.options.height + 'px')
    this.$tabs = this.find('.tabs')
    this.tabs = this.$tabs.get(0) as HTMLElement
    this.$slider = this.find('.slider')

    this.bindEvent()
    this.hideScrollbar()
  }
  get length() {
    return (this.$tabs.find(this.c('.item')) as any).length
  }
  /** Insert tab at given position. */
  insert(pos: number, tab: ITab) {
    const { c, $tabs } = this
    const itemHeight = this.options.height - 1

    const $items = $tabs.find(c('.item')) as any
    const len: number = $items.length
    const html = `<div class="${this.c('item')}" data-id="${escape(
      tab.id
    )}" style="height: ${itemHeight}px; line-height: ${itemHeight}px;">${escape(
      tab.title
    )}</div>`
    if (pos > len - 1) {
      $tabs.append(html)
    } else {
      $items.eq(pos).before(html)
    }

    this.updateSlider()
  }
  /** Append tab. */
  append(tab: ITab) {
    this.insert(this.length, tab)
  }
  /** Remove tab. */
  remove(id: string) {
    const { c } = this

    const self = this
    this.$tabs.find(c('.item')).each(function (this: HTMLElement) {
      const $this = $(this)
      if ($this.data('id') === id) {
        if ($this.hasClass(c('selected'))) {
          if (self.length > 0) {
            const id = self.$tabs.find(c('.item')).eq(0).data('id')
            self.select(id)
          } else {
            self.emit('deselect')
          }
        }
        $this.remove()
      }
    })
    this.updateSlider()
  }
  /** Select tab. */
  select(id: string) {
    const { c } = this

    const self = this
    this.$tabs.find(c('.item')).each(function (this: HTMLElement) {
      const $this = $(this)

      if ($this.data('id') === id) {
        $this.addClass(c('selected'))
        self.updateSlider()
        self.scrollToSelected()
        self.emit('select', id)
      } else {
        $this.rmClass(c('selected'))
      }
    })
  }
  private scrollToSelected() {
    const { $tabs, tabs, c } = this
    const item = $tabs.find(c('.selected')).get(0) as HTMLElement

    const itemLeft = item.offsetLeft
    const itemWidth = item.offsetWidth
    const containerWidth = tabs.offsetWidth
    const scrollLeft = tabs.scrollLeft
    let targetScrollLeft

    if (itemLeft < scrollLeft) {
      targetScrollLeft = itemLeft
    } else if (itemLeft + itemWidth > containerWidth + scrollLeft) {
      targetScrollLeft = itemLeft + itemWidth - containerWidth
    }

    if (!isNum(targetScrollLeft)) {
      return
    }

    tabs.scrollLeft = targetScrollLeft as number
  }
  private hideScrollbar() {
    const { $tabs } = this

    if (getComputedStyle(this.tabs, '::-webkit-scrollbar').display === 'none') {
      return
    }

    const scrollbarHeight = measuredScrollbarWidth()
    $tabs.css('height', $tabs.offset().height + scrollbarHeight + 'px')
  }
  private updateSlider() {
    const { $slider, $tabs, c } = this

    const selected = $tabs.find(c('.selected')).get(0) as HTMLElement

    if (!selected) {
      $slider.css({ width: 0 })
      return
    }

    $slider.css({
      width: selected.offsetWidth,
      left: selected.offsetLeft - $tabs.get(0).scrollLeft,
    })
  }
  private bindEvent() {
    const { tabs, c } = this

    const self = this
    this.$tabs
      .on('wheel', function (e) {
        e.preventDefault()
        tabs.scrollLeft += e.origEvent.deltaY
      })
      .on('click', c('.item'), function (this: HTMLElement) {
        const $item = $(this)
        self.select($item.data('id'))
      })
      .on('scroll', () => {
        this.updateSlider()
      })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="tabs-container">
          <div class="tabs"></div>
        </div>
        <div class="slider"></div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Tab)
}
