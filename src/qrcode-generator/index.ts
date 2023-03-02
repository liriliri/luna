import stripIndent from 'licia/stripIndent'
import { exportCjs } from '../share/util'
import Component from '../share/Component'
import QRCode from 'qrcode'

/**
 * QR code generator.
 */
export default class QrcodeGenerator extends Component {
  private canvas: HTMLCanvasElement
  constructor(container: HTMLInputElement) {
    super(container, { compName: 'qrcode-generator' })

    this.initTpl()
    const $canvas = this.find('.qrcode').find('canvas')
    this.canvas = $canvas.get(0) as HTMLCanvasElement

    this.generate()
  }
  private generate() {
    QRCode.toCanvas(this.canvas, 'test')
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="controller">
          <div class="setting"></div>
          <div class="input">
            <textarea></textarea>
          </div>
        </div>
        <div class="preview">
          <div class="qrcode">
            <canvas></canvas>
          </div>
          <div class="action"></div>
        </div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, QrcodeGenerator)
}
