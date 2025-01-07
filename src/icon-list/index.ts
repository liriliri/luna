import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import map from 'licia/map'
import ResizeSensor from 'licia/ResizeSensor'

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

const GAP = 20

/**
 * Show list of icons and their names.
 *
 * @example
 * const iconList = new LunaIconList(container)
 */
export default class IconList extends Component<IOptions> {
  private resizeSensor: ResizeSensor
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'icon-list' }, options)

    this.resizeSensor = new ResizeSensor(container)

    this.initOptions(options, {
      icons: [],
      size: 72,
    })

    this.updateColumnCount()
    this.render()

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.updateColumnCount)
  }
  private updateColumnCount = () => {
    const { $container, c } = this
    const { size, icons } = this.options
    const containerWidth = $container.offset().width

    const columnCount = Math.floor(containerWidth / (size + GAP))

    if (icons.length >= columnCount) {
      const gap = Math.floor(
        (containerWidth - columnCount * size) / columnCount
      )
      $container.addClass(c('grid'))
      $container.css({
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gap: `${GAP}px ${gap}px`,
        padding: `0 ${gap / 2}px`,
      })
    } else {
      $container.rmClass(c('grid'))
      $container.css({
        gap: '0',
        padding: `0 ${GAP / 2}px`,
      })
    }
  }
  private render() {
    const { size } = this.options

    const html = map(this.options.icons, (icon) => {
      return this.c(`
        <div class="item" style="width: ${size}px;">
          <div class="icon" style="height: ${size}px;">
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
