import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import map from 'licia/map'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Icon list. */
  icons?: IIcon[]
  /** Icon size. */
  size?: number
}

/** IIcon */
export interface IIcon {
  src: string
  name: string
}

const MIN_GAP = 20

/**
 * Show list of icons and their names.
 *
 * @example
 * const iconList = new LunaIconList(container)
 */
export default class IconList extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'icon-list' }, options)

    this.initOptions(options, {
      icons: [],
      size: 48,
    })

    this.updateColumnCount()
    this.render()
  }
  private updateColumnCount() {
    const { $container } = this
    const { size } = this.options
    const containerWidth = $container.offset().width

    const columnCount = Math.floor(containerWidth / (size + MIN_GAP))
    const gap = Math.floor((containerWidth - columnCount * size) / columnCount)

    $container.css({
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      gap: `${gap}px ${gap}px`,
      padding: `${gap / 2}px`,
    })
  }
  private render() {
    const { size } = this.options

    const html = map(this.options.icons, (icon) => {
      return this.c(`
        <div class="item">
          <div class="icon" style="width: ${size}px; height: ${size}px;">
            <img src="${icon.src}"></img>
          </div>
          <div class="name">${icon.name}</div>
        </div>
      `)
    }).join('')

    this.$container.html(html)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, IconList)
}
