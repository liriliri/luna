import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import last from 'licia/last'
import $ from 'licia/$'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import each from 'licia/each'
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
  private $images: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'image-list' })

    this.initOptions(options, {
      rowHeight: 200,
      horizontalMargin: 20,
      verticalMargin: 20,
      showTitle: true,
    })

    this.initTpl()

    const $images = this.find('.images')
    $images.css({
      marginLeft: this.options.horizontalMargin + 'px',
      marginBottom: -this.options.verticalMargin + 'px',
    })
    if (!this.options.showTitle) {
      $images.addClass(this.c('no-title'))
    }
    this.$images = $images

    const galleryContainer = this.find('.gallery').get(0) as HTMLElement
    this.gallery = new LunaGallery(galleryContainer)

    this.bindEvent()
  }
  /** Set images. */
  setImages(
    images: Array<{
      src: string
      title?: string
    }>
  ) {
    this.clear()
    each(images, ({ src, title }) => this.append(src, title))
  }
  /** Clear all images. */
  clear() {
    this.images = []
    this.$images.html('')
    this.gallery.clear()
  }
  /** Append image. */
  append(src: string, title?: string) {
    const { verticalMargin, horizontalMargin, rowHeight } = this.options
    const imageHeight = rowHeight - 20

    if (!title) {
      title = last(src.split('/'))
    }
    const item = toEl(
      this.c(stripIndent`
      <div class="item">
        <div class="image" style="height:${imageHeight}px;">
          <img src="${src}" alt="${title}"></img>
        </div>
        <div class="title">${title}</div>
      </div>`)
    ) as HTMLElement

    const $item = $(item)
    $item.css({
      display: 'none',
      marginRight: horizontalMargin + 'px',
      marginBottom: verticalMargin + 'px',
    })
    const $img = $item.find('img')
    const img = $img.get(0) as HTMLImageElement
    img.onload = () => {
      const ratio = img.width / img.height
      const width = imageHeight * ratio
      $item.css('flex-basis', width + 'px')
      $item.css('display', 'inline-flex')
    }

    this.$images.append(item)
    $item.data('idx', toStr(this.images.length))
    this.images.push({
      src,
      title: title || '',
      container: item,
    })
    this.gallery.append(src, title)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="images"></div>
        <div class="gallery"></div>
      `)
    )
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
