import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import raf from 'licia/raf'
import throttle from 'licia/throttle'
import ResizeSensor from 'licia/ResizeSensor'
import fullscreen from 'licia/fullscreen'
import CircleEffect from './CircleEffect'
import BarEffect from './BarEffect'
import LineEffect from './LineEffect'
import { resetCanvasSize } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Html audio element. */
  audio: HTMLAudioElement
  image: string
  fftSize?: number
}

export interface IEffect {
  draw(): void
}

/**
 * Music visualization.
 */
export default class MusicVisualizer extends Component<IOptions> {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  private onResize: () => void
  private resizeSensor: ResizeSensor
  private $controller: $.$
  private $canvas: $.$
  private effects: IEffect[]
  private freqByteData: Uint8Array = new Uint8Array(0)
  private analyser: AnalyserNode
  private animationId: number
  private autoHideTimer: any = 0
  private idx = 0
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'music-visualizer' })

    this.initOptions(options, {
      fftSize: 512,
      background: '',
    })
    this.options.audio.crossOrigin = 'anonymous'

    this.effects = [
      new CircleEffect(this),
      new BarEffect(this),
      new LineEffect(this),
    ]
    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      resetCanvasSize(this.canvas)
      this.emit('resize')
    }, 16)

    this.initTpl()
    this.$canvas = this.find('.canvas')
    this.canvas = this.$canvas.get(0) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    resetCanvasSize(this.canvas)
    this.$controller = this.find('.controller')

    this.bindEvent()
  }
  destroy() {
    this.resizeSensor.destroy()
    this.$container.off('mousemove', this.onMouseMove)
    this.stop()
    super.destroy()
  }
  getData() {
    const { freqByteData } = this
    if (!this.analyser) {
      return freqByteData
    }
    this.analyser.getByteFrequencyData(freqByteData)

    return freqByteData
  }
  private start() {
    if (this.animationId) {
      this.stop()
    }
    const animate = () => {
      this.draw()
      this.animationId = raf(animate)
    }
    this.$controller.rmClass(this.c('active'))
    animate()
  }
  private stop() {
    raf.cancel(this.animationId)
    this.$controller.addClass(this.c('active'))
    this.animationId = 0
  }
  private initAudio() {
    const { audio, fftSize } = this.options
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    this.analyser = analyser
    const audioSource = audioContext.createMediaElementSource(audio)
    analyser.fftSize = fftSize
    this.freqByteData = new Uint8Array(analyser.frequencyBinCount)
    audioSource.connect(analyser)
    analyser.connect(audioContext.destination)
  }
  private bindEvent() {
    const { c } = this
    const { audio } = this.options

    audio.addEventListener('play', this.onPlay)
    audio.addEventListener('pause', this.onPause)

    this.resizeSensor.addListener(this.onResize)

    this.$controller
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)
      .on('click', c('.icon-step-forward'), this.next)
    this.$container.on('mousemove', this.onMouseMove)
  }
  private next = () => {
    this.idx++
    if (this.idx >= this.effects.length) {
      this.idx = 0
    }
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private onMouseMove = () => {
    const { c, $container } = this

    $container.rmClass(c('controller-hidden'))
    clearTimeout(this.autoHideTimer)
    this.autoHideTimer = setTimeout(() => {
      $container.addClass(c('controller-hidden'))
    }, 3000)
  }
  private onPlay = () => {
    if (!this.analyser) {
      this.initAudio()
    }
    this.start()
  }
  private onPause = () => {
    this.stop()
  }
  private draw() {
    this.effects[this.idx].draw()
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <canvas class="canvas"></canvas> 
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-left">
          <span class="icon icon-step-forward"></span>
        </div>
        <div class="controller-right">
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
      `)
    )
  }
}

module.exports = MusicVisualizer
module.exports.default = MusicVisualizer
