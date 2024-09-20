import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import noop from 'licia/noop'
import perfNow from 'licia/perfNow'
import fullscreen from 'licia/fullscreen'
import raf from 'licia/raf'
import pointerEvent from 'licia/pointerEvent'
import { eventPage, exportCjs } from '../share/util'
import { piCreateAudioContext, piCreateFPSCounter } from './piLibs'
import Effect from './Effect'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Render pass. */
  renderPass?: any[]
  /** Player controls. */
  controls?: boolean
}

/**
 * Shader toy player.
 *
 * @example
 * const container = document.getElementById('container')
 * const shaderToyPlayer = new LunaShaderToyPlayer(container)
 *
 * shaderToyPlayer.setOption('renderPass', [
 *   {
 *     inputs: [],
 *     outputs: [],
 *     code: `void mainImage( out vec4 fragColor, in vec2 fragCoord )
 * {
 *     vec2 uv = fragCoord/iResolution.xy;
 *     vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
 *     fragColor = vec4(col,1.0);
 * }`,
 *     name: 'Image',
 *     description: '',
 *     type: 'image',
 *   },
 * ])
 */
export default class ShaderToyPlayer extends Component<IOptions> {
  private $canvas: $.$
  private canvas: HTMLCanvasElement = document.createElement('canvas')
  private $controller: $.$
  private $play: $.$
  private $volume: $.$
  private $resolution: $.$
  private $time: $.$
  private $fps: $.$
  private effect: any
  private isRendering = false
  private time = 0
  private timeOffset = 0
  private timeBase = perfNow()
  private isRestarted = true
  private _isPaused = true
  private fpsCounter: any = piCreateFPSCounter()
  private autoHideTimer: any = 0
  private animationId: number
  private startX = 0
  private startY = 0
  private x = 0
  private y = 0
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'shader-toy-player' })

    this.initOptions(options, {
      controls: true,
    })

    this.fpsCounter.Reset(this.timeBase)

    this.initTpl()
    this.$canvas = this.find('.canvas')
    this.$canvas.append(this.canvas)
    this.$controller = this.find('.controller')
    this.$play = this.find('.play')
    this.$volume = this.find('.volume')
    this.$resolution = this.find('.resolution')
    this.$time = this.find('.time')
    this.$fps = this.find('.fps')

    this.effect = new (Effect as any)(
      null,
      piCreateAudioContext(),
      this.canvas,
      null,
      null,
      false,
      false,
      this.onResize,
      noop
    )

    this.bindEvent()

    if (this.options.renderPass) {
      this.load(this.options.renderPass)
    }

    if (!this.options.controls) {
      this.$controller.hide()
    }
  }
  destroy() {
    raf.cancel.call(window, this.animationId)
    this.pause()
    this.$container.off('mousemove', this.onMouseMove)
    super.destroy()
  }
  play() {
    this.isPaused = false
    this.timeOffset = this.time
    this.timeBase = perfNow()
    this.isRestarted = true
    this.effect.ResumeOutputs()
  }
  pause() {
    if (this.isPaused) {
      return
    }
    this.isPaused = true
    this.effect.StopOutputs()
  }
  reset = () => {
    this.timeOffset = 0
    this.timeBase = perfNow()
    this.time = 0
    this.isRestarted = true
    this.effect.ResetTime()
  }
  private load(pass: any[]) {
    const { effect } = this
    this.pause()

    if (!effect.Load({ ver: '0.1', renderpass: pass })) {
      return
    }

    effect.Compile(true, () => {
      this.isPaused = false
      this.startRendering()
      this.reset()
    })
  }
  private get isPaused() {
    return this._isPaused
  }
  private set isPaused(paused: boolean) {
    const { $controller, $play, c } = this
    this._isPaused = paused

    if (paused) {
      $controller.addClass(c('active'))
      $play.html(c('<span class="icon icon-play"></span>'))
    } else {
      $controller.rmClass(c('active'))
      $play.html(c('<span class="icon icon-pause"></span>'))
    }
  }
  private onMouseMove = () => {
    const { c, $container } = this

    $container.rmClass(c('controller-hidden'))
    clearTimeout(this.autoHideTimer)
    this.autoHideTimer = setTimeout(() => {
      $container.addClass(c('controller-hidden'))
    }, 3000)
  }
  private bindEvent() {
    const { c } = this

    this.$controller
      .on('click', c('.reset'), this.reset)
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.volume'), this.toggleVolume)
      .on('click', c('.fps-button'), this.toggleFps)
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)

    this.$container.on('mousemove', this.onMouseMove)

    this.$canvas.on(pointerEvent('down'), this.onDragStart)

    this.on('optionChange', (name, val) => {
      if (name === 'renderPass') {
        this.load(val)
      }
    })
  }
  private onDragStart = (e: any) => {
    const { x, y } = this.getXY(e)
    this.startX = x
    this.startY = y
    this.x = x
    this.y = y

    $document.on(pointerEvent('move'), this.onDragMove)
    $document.on(pointerEvent('up'), this.onDragEnd)
  }
  private onDragMove = (e: any) => {
    const { x, y } = this.getXY(e)

    this.x = x
    this.y = y
  }
  private getXY(e: any) {
    e = e.origEvent
    const { canvas } = this
    const offset = this.$canvas.offset()
    const pageX = eventPage('x', e)
    const pageY = eventPage('y', e)

    let x = Math.floor(((pageX - offset.left) / offset.width) * canvas.width)
    let y = Math.floor(
      canvas.height - ((pageY - offset.top) / offset.height) * canvas.height
    )

    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      x = this.x
      y = this.y
    }

    return { x, y }
  }
  private onDragEnd = () => {
    $document.off(pointerEvent('move'), this.onDragMove)
    $document.off(pointerEvent('up'), this.onDragEnd)
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private toggleFps = () => {
    this.$fps.toggleClass(this.c('active'))
  }
  private toggleVolume = () => {
    const { c, $volume } = this

    if (this.effect.ToggleVolume()) {
      $volume.html(c('<span class="icon icon-volume-off"></span>'))
    } else {
      $volume.html(c('<span class="icon icon-volume"></span>'))
    }
  }
  private togglePlay = () => {
    if (this.isPaused) {
      this.play()
    } else {
      this.pause()
    }
  }
  private onResize = () => {
    const { width, height } = this.canvas

    this.$resolution.text(`${width} × ${height}`)
  }
  private renderTime() {
    this.$time.text((this.time / 1000.0).toFixed(2))
  }
  private renderFps() {
    this.$fps.text('FPS: ' + this.fpsCounter.GetFPS().toFixed(1))
  }
  private startRendering() {
    if (this.isRendering) {
      return
    }

    const { effect } = this

    this.isRendering = true

    const loop = () => {
      this.animationId = raf(loop)

      const now = perfNow()
      let time = 0.0
      let dtime = 0.0
      if (this.isPaused) {
        time = this.time
        dtime = 1000.0 / 60.0
      } else {
        time = this.timeOffset + now - this.timeBase
        if (this.isRestarted) {
          dtime = 1000.0 / 60.0
        } else {
          dtime = time - this.time
        }
        this.time = time
      }
      this.isRestarted = false

      this.fpsCounter.Count(now)

      effect.Paint(
        time / 1000.0,
        dtime / 1000.0,
        this.fpsCounter.GetFPS(),
        this.startX,
        this.startY,
        this.x,
        this.y,
        this.isPaused
      )

      this.renderTime()
      this.renderFps()
    }
    loop()
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="canvas"></div>
      <div class="fps"></div>
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-left">
          <div class="reset">
            <span class="icon icon-step-backward"></span>
          </div>
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
          <div class="volume">
            <span class="icon icon-volume"></span>
          </div>
          <span class="time">0.00</span>
        </div>
        <div class="controller-right">
          <span class="resolution"></span>
          <span class="fps-button">FPS</span>
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ShaderToyPlayer)
}
