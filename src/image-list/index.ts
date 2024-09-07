import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import last from 'licia/last'
import $ from 'licia/$'
import h from 'licia/h'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import LunaGallery from 'luna-gallery'
import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Row height. */
  rowHeight?: number
  /** Show title. */
  showTitle?: boolean
  /** Horizontal margin. */
  horizontalMargin?: number
  /** Vertical margin. */
  verticalMargin?: number
}

interface IImage {
  src: string
  title: string
  container: HTMLElement
}

/**
 * Show list of images.
 *
 * @example
 * const imageList = new LunaImageList(container)
 * imageList.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
 */
export default class ImageList extends Component<IOptions> {
  private images: IImage[] = []
  private gallery: LunaGallery
  private galleryContainer: HTMLElement = h('div')
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'image-list' })

    this.initOptions(options, {
      rowHeight: 200,
      horizontalMargin: 20,
      verticalMargin: 20,
      showTitle: true,
    })

    document.body.appendChild(this.galleryContainer)
    this.gallery = new LunaGallery(this.galleryContainer)

    const { $container } = this
    $container.css({
      marginLeft: this.options.horizontalMargin + 'px',
      marginBottom: -this.options.verticalMargin + 'px',
    })
    if (!this.options.showTitle) {
      $container.addClass(this.c('no-title'))
    }

    this.bindEvent()
  }
  destroy() {
    document.body.removeChild(this.galleryContainer)
    super.destroy()
  }
  /** Append image. */
  append(src: string, title?: string) {
    const { verticalMargin, horizontalMargin, rowHeight } = this.options
    const imageHeight = rowHeight - 20

    if (!title) {
      title = last(src.split('/'))
    }
    const container = toEl(
      this.c(stripIndent`
      <div class="item">
        <div class="image" style="height:${imageHeight}px;">
          <img src="${src}" alt="${title}"></img>
        </div>
        <div class="title">${title}</div>
      </div>`)
    ) as HTMLElement

    const $container = $(container)
    $container.css({
      marginRight: horizontalMargin + 'px',
      marginBottom: verticalMargin + 'px',
    })
    const $img = $container.find('img')
    const img = $img.get(0) as HTMLImageElement
    img.onload = () => {
      const ratio = img.width / img.height
      const width = imageHeight * ratio
      $container.css('flex-basis', width + 'px')
      this.$container.append(container)

      $container.data('idx', toStr(this.images.length))

      this.images.push({
        src,
        title: title || '',
        container,
      })

      this.gallery.append(src, title)
    }
  }
  private bindEvent() {
    const { gallery } = this

    this.$container.on('click', this.c('.item'), function (this: HTMLElement) {
      const idx = toNum($(this).data('idx'))
      gallery.slideTo(idx)
      gallery.show()
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ImageList)
}
