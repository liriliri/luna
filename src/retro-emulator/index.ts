import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import fullscreen from 'licia/fullscreen'
import Component, { IComponentOptions } from '../share/Component'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bootstrap = require('!raw-loader!./bootstrap').default

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Libretro core url. */
  core: string
  /** BrowserFS url. */
  browserFS: string
}

/**
 * Retro emulator using libretro.
 */
export default class RetroEmulator extends Component<IOptions> {
  private $controller: $.$
  private $iframeContainer: $.$
  private iframe: HTMLIFrameElement
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'retro-emulator' })

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
    const { browserFS, core } = this.options
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
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: black;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #canvas {
          width: auto !important;
          height: 100% !important;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      </style>
      <script src="${browserFS}"></script>
    </head>
    <body>
      <div class="webplayer-container">
        <canvas id="canvas"></canvas>
      </div>
      <script>var gameUrl = '${url}';${bootstrap}</script>
      <script src="${core}"></script>
    </body>
    </html>
    `
    const iframeDocument = iframe.contentWindow?.document as Document
    iframeDocument.open()
    iframeDocument.write(html)
    iframeDocument.close()

    this.iframe = iframe
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private bindEvent() {
    const { c } = this

    this.$controller
      .on('click', c('.icon-file'), this.open)
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)
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

module.exports = RetroEmulator
module.exports.default = RetroEmulator
