import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import Component, { IComponentOptions } from '../share/Component'
const FCEUmm = require('!raw-loader!./FCEUmm').default

/** IOptions */
export interface IOptions extends IComponentOptions {
  FCEUmm: string
  browserFS: string
}

/**
 * Nintendo Famicom emulator using FCEUmm.
 */
export default class FcEmulator extends Component<IOptions> {
  private $controller: $.$
  private $iframeContainer: $.$
  private iframe: HTMLIFrameElement
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'fc-emulator' })

    this.initOptions(options)

    this.initTpl()
    this.$controller = this.find('.controller')
    this.$iframeContainer = this.find('.iframe-container')

    this.bindEvent()
  }
  open = async () => {
    const [file] = await openFile()

    this.load(createUrl(file))
  }
  load(url?: string) {
    const { browserFS, FCEUmm: FCEUmmLib } = this.options
    const { $iframeContainer } = this
    if (this.iframe) {
      this.$iframeContainer.html('')
    }
    const iframe = document.createElement('iframe')
    $iframeContainer.append(iframe)

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html, body {
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        .webplayer-container {
          position: fixed;
          width: 100%;
          height: 100%;
        }
        #canvas {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
      <script src="${browserFS}"></script>
    </head>
    <body>
      <div class="webplayer-container">
        <canvas id="canvas"></canvas>
      </div>
      <script>var gameUrl = '${url}';${FCEUmm}</script>
      <script src="${FCEUmmLib}"></script>
    </body>
    </html>
    `
    const iframeDocument = iframe.contentWindow?.document as Document
    iframeDocument.open()
    iframeDocument.write(html)
    iframeDocument.close()

    this.iframe = iframe
  }
  private bindEvent() {
    const { c } = this

    this.$controller.on('click', c('.icon-file'), this.open)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="iframe-container">
        
      </div>
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-left">
          <span class="icon icon-file"></span>
        </div>
        <div class="controller-right">
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
      `)
    )
  }
}

module.exports = FcEmulator
module.exports.default = FcEmulator
