import $ from 'licia/$'
import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import Color from 'licia/Color'
import clamp from 'licia/clamp'
import throttle from 'licia/throttle'
import pointerEvent from 'licia/pointerEvent'
import { rgbToHsv } from './util'
import { exportCjs, eventPage } from '../share/util'

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
  private $swatch: $.$
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
    this.$swatch = this.find('.swatch')

    this.bindEvent()

    this.updateColor()
  }
  private updateColor = () => {
    const hsl = this.color.toHsl()
    const rgb = this.color.toRgb()
    const color = Color.parse(hsl)
    const hsv = this.getHsv()

    this.$saturation.css('background', `hsl(${color.val[0]},100%, 50%)`)
    this.updateSaturationPointer(-hsv[2] + 100, hsv[1])

    this.$swatch.css('backgroundColor', rgb)
  }
  private getHsv() {
    const rgb = this.color.toRgb()
    const color = Color.parse(rgb)
    const { val } = color

    return rgbToHsv(val[0], val[1], val[2])
  }
  private bindEvent() {
    this.$saturation.on(pointerEvent('down'), this.onSaturationStart)

    const updateColor = throttle(this.updateColor, 50)
    this.on('changeOption', (name, val) => {
      switch (name) {
        case 'color':
          this.color = new Color(val)
          updateColor()
          break
      }
    })
  }
  private onSaturationStart = (e: any) => {
    this.onSaturationMove(e)

    $document.on(pointerEvent('move'), this.onSaturationMove)
    $document.on(pointerEvent('up'), this.onSaturationEnd)
  }
  private onSaturationMove = (e: any) => {
    e = e.origEvent

    const offset = this.$saturation.offset()
    const pageX = eventPage('x', e)
    const pageY = eventPage('y', e)

    const top = clamp(((pageY - offset.top) / offset.height) * 100, 0, 100)
    const left = clamp(((pageX - offset.left) / offset.width) * 100, 0, 100)
    this.updateSaturationPointer(top, left)
  }
  private updateSaturationPointer(top: number, left: number) {
    this.$saturationPointer.css({
      top: `${top.toFixed(1)}%`,
      left: `${left.toFixed(1)}%`,
    })
  }
  private onSaturationEnd = () => {
    $document.off(pointerEvent('move'), this.onSaturationMove)
    $document.off(pointerEvent('up'), this.onSaturationEnd)
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
          <div class="controls">
            <div class="color">
              <div class="swatch-container">
                <div class="swatch"></div>
              </div>
            </div>
            <div class="toggles">
              <div class="hue"></div>
              <div class="alpha"></div>
            </div>
          </div>
        </div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ColorPicker)
}
