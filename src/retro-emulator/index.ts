import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import fullscreen from 'licia/fullscreen'
import keyCode from 'licia/keyCode'
import some from 'licia/some'
import Component, { IComponentOptions } from '../share/Component'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bootstrap = require('!raw-loader!./bootstrap').default
const trigger = require('licia/trigger')

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
  private $play: $.$
  private iframe: HTMLIFrameElement
  private autoHideTimer: any = 0
  private isPaused = true
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'retro-emulator' })

    this.initOptions(options)

    this.initTpl()
    this.$controller = this.find('.controller')
    this.$play = this.find('.play')
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

    this.isPaused = false
    this.renderPlay()
  }
  destroy() {
    document.removeEventListener('keydown', this.onKeydown)
    document.removeEventListener('keyup', this.onKeyup)
    document.removeEventListener('keypress', this.onKeypress)
    this.$container.off('mousemove', this.onMouseMove)
    super.destroy()
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private bindEvent() {
    const { c } = this

    this.$container.on('mousemove', this.onMouseMove)

    this.$controller
      .on('click', c('.icon-file'), this.open)
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)
      .on('click', c('.play'), this.togglePlay)

    document.addEventListener('keydown', this.onKeydown)
    document.addEventListener('keyup', this.onKeyup)
    document.addEventListener('keypress', this.onKeypress)
  }
  private togglePlay = () => {
    if (!this.iframe) {
      return
    }
    this.isPaused = !this.isPaused
    this.pressKey('KeyP')
    this.renderPlay()
  }
  private renderPlay() {
    const { c, $controller, $play } = this
    if (this.isPaused) {
      $controller.addClass(c('active'))
      $play.html(c('<span class="icon icon-play"></span>'))
    } else {
      $controller.rmClass(c('active'))
      $play.html(c('<span class="icon icon-pause"></span>'))
    }
  }
  private pressKey(code: string) {
    const event = {
      code,
    }
    this.triggerEvent('keydown', new KeyboardEvent('keydown', event))
    setTimeout(() => {
      this.triggerEvent('keypress', new KeyboardEvent('keypress', event))
    }, 10)
    setTimeout(() => {
      this.triggerEvent('keyup', new KeyboardEvent('keyup', event))
    }, 60)
  }
  private onMouseMove = () => {
    const { c } = this

    this.$controller.rmClass(c('controller-hidden'))
    clearTimeout(this.autoHideTimer)
    this.autoHideTimer = setTimeout(() => {
      this.$controller.addClass(c('controller-hidden'))
    }, 3000)
  }
  private onKeypress = (e: any) => {
    if (this.isHotkey(e)) {
      return
    }
    this.triggerEvent('keypress', e)
  }
  private onKeydown = (e: any) => {
    if (this.isHotkey(e)) {
      return
    }
    this.triggerEvent('keydown', e)
  }
  private onKeyup = (e: any) => {
    if (this.isHotkey(e)) {
      return
    }
    this.triggerEvent('keyup', e)
  }
  private isHotkey = (e: any) => {
    return some(
      ['h', 'H', 'p', 'P', 'space'],
      (val) => keyCode(val) === e.keyCode
    )
  }
  private triggerEvent(type: string, e: any) {
    if (!this.iframe) {
      return
    }
    const iframeDocument = this.iframe.contentWindow?.document as any
    trigger(iframeDocument, type, e)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="iframe-container"></div>
      <div class="iframe-mask"></div>
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-left">
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
        </div>
        <div class="controller-right">
          <span class="icon icon-file"></span>
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
      `)
    )
  }
}

module.exports = RetroEmulator
module.exports.default = RetroEmulator
