import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import noop from 'licia/noop'
import perfNow from 'licia/perfNow'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Effect = require('./Effect')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { piCreateAudioContext, piCreateFPSCounter } = require('./piLibs')

export default class ShaderToyPlayer extends Component {
  private $canvas: $.$
  private canvas: HTMLCanvasElement = document.createElement('canvas')
  private effect: any
  private isRendering = false
  private isPaused = false
  private time = 0
  private timeOffset = 0
  private timeBase = perfNow()
  private isRestarted = true
  private fpsCounter: any = piCreateFPSCounter()
  constructor(container: HTMLElement) {
    super(container, { compName: 'shader-toy-player' })

    this.fpsCounter.Reset(this.timeBase)

    this.initTpl()
    this.$canvas = this.find('.canvas')
    this.$canvas.append(this.canvas)

    this.effect = new Effect(
      null,
      piCreateAudioContext(),
      this.canvas,
      noop,
      null,
      false,
      false,
      this.onResize,
      this.onCrash
    )
  }
  load(pass: any[]) {
    const { effect } = this

    if (!effect.Load({ ver: '0.1', renderpass: pass })) {
      return
    }

    effect.Compile(true, () => {
      this.startRendering()
      this.resetTime()
    })
  }
  private resetTime() {
    this.timeOffset = 0
    this.timeBase = perfNow()
    this.time = 0
    this.isRestarted = true
    this.effect.ResetTime()
  }
  private onResize = () => {
    console.log('on resize')
  }
  private onCrash = () => {
    console.log('on crash')
  }
  private startRendering() {
    if (this.isRendering) {
      return
    }

    const { effect } = this

    this.isRendering = true

    const loop = () => {
      effect.RequestAnimationFrame(loop)

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
        -0,
        -0,
        0,
        0,
        this.isPaused
      )
    }
    loop()
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="canvas"></div>
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-left">
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
        </div>
      </div>
      `)
    )
  }
}

module.exports = ShaderToyPlayer
module.exports.default = ShaderToyPlayer
