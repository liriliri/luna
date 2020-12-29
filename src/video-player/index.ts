import $ from 'licia/$'
import each from 'licia/each'
import Emitter from 'licia/Emitter'
import clamp from 'licia/clamp'
import stripIndent from 'licia/stripIndent'
import { classPrefix, eventClient, drag } from '../share/util'

const c = classPrefix('video-player')
const $document = $(document as any)

interface IOptions {
  url?: string
}

const videoEvents = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mozaudioavailable',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
]

export = class VideoPlayer extends Emitter {
  private $container: $.$
  private $video: $.$
  private $controller: $.$
  private $bar: $.$
  private $barPlayed: $.$
  private $barLoaded: $.$
  private video: HTMLVideoElement
  private videoTimeUpdate = true
  constructor(container: Element, { url = '' }: IOptions = {}) {
    super()

    const $container = $(container)
    $container.addClass('luna-video-player')
    this.$container = $container
    this.appendTpl()

    this.$controller = $container.find(`.${c('controller')}`)
    this.$bar = $container.find(`.${c('controller-top')}`)
    this.$barPlayed = $container.find(`.${c('bar-played')}`)
    this.$barLoaded = $container.find(`.${c('bar-loaded')}`)
    this.$video = $container.find(`.${c('video')}`)
    this.video = $container.find('video').get(0) as HTMLVideoElement

    this.bindEvent()

    if (url) {
      this.video.src = url
    }
  }
  play() {
    if (!this.video.src) {
      return
    }

    return this.video.play()
  }
  pause() {
    if (!this.video.src) {
      return
    }

    this.video.pause()
  }
  destroy() {
    this.$container.rmClass('luna-video-player')
    this.$container.html('')
  }
  seek(time: number) {
    if (!this.video.src) {
      return
    }

    time = Math.max(time, 0)
    time = Math.min(time, this.video.duration)

    this.video.currentTime = time
  }
  private togglePlay = () => {
    if (this.video.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
  private bindEvent() {
    this.$controller
      .on('click', `.${c('controller-top')}`, this.onBarClick)
      .on(drag('start'), `.${c('controller-top')}`, this.onBarDragStart)

    this.$video.on('click', this.togglePlay)

    each(videoEvents, (event) => {
      this.video.addEventListener(
        event,
        (...args) => this.emit(event, ...args),
        false
      )
    })

    this.on('timeupdate', this.onTimeUpdate)
    this.on('canplay', this.onLoaded)
    this.on('progress', this.onLoaded)
  }
  private onLoaded = () => {
    const { video } = this
    let percent = 0
    const len = video.buffered.length
    if (len) {
      percent = (video.buffered.end(len - 1) / video.duration) * 100
    }

    this.$barLoaded.css('width', percent.toFixed(2) + '%')
  }
  private onBarDragStart = () => {
    this.videoTimeUpdate = false
    $document.on(drag('move'), this.onBarDragMove)
    $document.on(drag('end'), this.onBarDragEnd)
  }
  private onBarDragMove = (e: any) => {
    this.updateTimeUi(this.getBarClickTime(e))
  }
  private onBarDragEnd = (e: any) => {
    $document.off(drag('move'), this.onBarDragMove)
    $document.off(drag('end'), this.onBarDragEnd)
    this.videoTimeUpdate = true
    this.onBarClick(e)
  }
  private onBarClick = (e: any) => {
    const time = this.getBarClickTime(e)
    this.seek(time)
    this.updateTimeUi(time)
  }
  private getBarClickTime(e: any) {
    const { left, width } = this.$bar.offset()
    const percent = clamp((eventClient('x', e.origEvent) - left) / width, 0, 1)
    return percent * this.video.duration
  }
  private onTimeUpdate = () => {
    if (this.videoTimeUpdate) {
      this.updateTimeUi(this.video.currentTime)
    }
  }
  private updateTimeUi(currentTime: number) {
    const percent = (currentTime / this.video.duration) * 100
    this.$barPlayed.css('width', percent.toFixed(2) + '%')
  }
  private appendTpl() {
    this.$container.html(stripIndent`
      <div class="${c('video')}">
        <video></video>
      </div>
      <div class="${c('controller')}">
        <div class="${c('controller-top')}">
          <div class="${c('bar')}">
            <div class="${c('bar-loaded')}"></div>
            <div class="${c('bar-played')}">
              <span class="${c('bar-thumb')}"></span>
            </div>
          </div>
        </div>
      </div>
    `)
  }
}
