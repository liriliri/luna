import $ from 'licia/$'
import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import Color from 'licia/Color'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Initial color. */
  color?: string
}

/**
 * Color picker.
 *
 * @example
 * const colorPicker = new LunaColorPicker(container)
 */
export default class ColorPicker extends Component<IOptions> {
  private color: Color
  private $saturation: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'color-picker' })
    this.$container = $(container)

    this.initOptions(options, {
      color: '#1a73e8',
    })

    this.color = new Color(this.options.color)

    this.initTpl()
    this.$saturation = this.find('.saturation')

    this.updateColor()
  }
  private updateColor() {
    const hsl = this.color.toHsl()
    const color = Color.parse(hsl)

    this.$saturation.css('background', `hsl(${color.val[0]},100%, 50%)`)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="saturation">
          <div class="saturation-white">
            <div class="saturation-black"></div>
            <div class="saturation-pointer"></div>
          </div>
        </div>
        <div class="body">
        </div>
      `)
    )
  }
}

module.exports = ColorPicker
module.exports.default = ColorPicker
