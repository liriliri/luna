import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'

/** IOptions. */
export interface IOptions extends IComponentOptions {
  /** Canvas width. */
  width?: number
  /** Canvas height. */
  height?: number
}

/**
 * Simple drawing tool.
 *
 * @example
 * const container = document.getElementById('container')
 * const painer = new LunaPainter(container)
 */
export default class Painter extends Component<IOptions> {
  private $viewport: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'painter' }, options)

    this.initOptions(options, {
      width: 800,
      height: 600,
    })

    this.initTpl()

    this.$viewport = this.find('.viewport')
  }
  private initTpl() {
    const { width, height } = this.options

    this.$container.html(
      this.c(stripIndent`
        <div class="viewport">
          <div class="canvas-wrapper">
            <div class="canvas-container">
              <canvas width="${width}" height="${height}"></canvas>
            </div>
          </div>
        </div>
      `)
    )
  }
}
