import toEl from 'licia/toEl'
import stripIndent from 'licia/stripIndent'
import last from 'licia/last'
import $ from 'licia/$'
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
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'image-list' })

    this.initOptions(options, {
      rowHeight: 200,
      horizontalMargin: 20,
      verticalMargin: 20,
      showTitle: true,
    })

    const { $container } = this
    $container.css({
      marginLeft: this.options.horizontalMargin + 'px',
      marginBottom: -this.options.verticalMargin + 'px',
    })
    if (!this.options.showTitle) {
      $container.addClass(this.c('no-title'))
    }
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

      this.images.push({
        src,
        title: title || '',
        container,
      })
    }
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ImageList)
}
