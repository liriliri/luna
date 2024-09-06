import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Row height. */
  rowHeight?: number
}

/**
 * Show list of images.
 *
 * @example
 * const imageList = new LunaImageList(container)
 * imageList.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
 */
export default class ImageList extends Component {
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'image-list' })
    this.initOptions(options, {
      rowHeight: 180,
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ImageList)
}
