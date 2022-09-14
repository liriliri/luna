import $ from 'licia/$'
import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import Color from 'licia/Color'
import { rgbToHsv } from './util'
import { drag } from '../share/util'

const $document = $(document as any)

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
  private $saturationPointer: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'color-picker' })
    this.$container = $(container)

    this.initOptions(options, {
      color: '#1a73e8',
    })

    this.color = new Color(this.options.color)

    this.initTpl()
    this.$saturation = this.find('.saturation')
    this.$saturationPointer = this.find('.saturation-pointer')

    this.bindEvent()

    this.updateColor()
  }
  private updateColor() {
    const hsl = this.color.toHsl()
    const color = Color.parse(hsl)
    const hsv = this.getHsv()

    this.$saturation.css('background', `hsl(${color.val[0]},100%, 50%)`)
    this.updateSaturationPointer(-hsv[2] + 100, hsv[1])
  }
  private getHsv() {
    const rgb = this.color.toRgb()
    const color = Color.parse(rgb)
    const { val } = color

    return rgbToHsv(val[0], val[1], val[2])
  }
  private bindEvent() {
    const { c } = this
    this.$saturation.on(
      drag('start'),
      c('.saturation-pointer'),
      this.onSaturationStart
    )
  }
  private onSaturationStart = () => {
    $document.on(drag('move'), this.onSaturationMove)
    $document.on(drag('end'), this.onSaturationEnd)
  }
  private onSaturationMove = (e: any) => {}
  private updateSaturationPointer(top: number, left: number) {
    this.$saturationPointer.css({
      top: `${top}%`,
      left: `${left}%`,
    })
  }
  private onSaturationEnd = () => {
    $document.off(drag('move'), this.onSaturationMove)
    $document.off(drag('end'), this.onSaturationEnd)
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
