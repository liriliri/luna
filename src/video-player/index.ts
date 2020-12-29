import $ from 'licia/$'
import each from 'licia/each'
import Emitter from 'licia/Emitter'
import clamp from 'licia/clamp'
import stripIndent from 'licia/stripIndent'
import durationFormat from 'licia/durationFormat'
import fullscreen from 'licia/fullscreen'
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
  private container: Element
  private $container: $.$
  private $video: $.$
  private $controller: $.$
  private $curTime: $.$
  private $duration: $.$
  private $bar: $.$
  private $play: $.$
  private $barPlayed: $.$
  private $barLoaded: $.$
  private video: HTMLVideoElement
  private videoTimeUpdate = true
  constructor(container: Element, { url = '' }: IOptions = {}) {
    super()

    const $container = $(container)
    $container.addClass('luna-video-player')
    this.container = container
    this.$container = $container
    this.appendTpl()

    this.$controller = $container.find(`.${c('controller')}`)
    this.$curTime = $container.find(`.${c('cur-time')}`)
    this.$duration = $container.find(`.${c('duration')}`)
    this.$play = $container.find(`.${c('play')}`)
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
  private togglePip = () => {
    if ((document as any).pictureInPictureElement) {
      ;(document as any).exitPictureInPicture()
    } else {
      ;(this.video as any).requestPictureInPicture()
    }
  }
  private bindEvent() {
    this.$controller
      .on('click', `.${c('play')}`, this.togglePlay)
      .on('click', `.${c('controller-top')}`, this.onBarClick)
      .on(drag('start'), `.${c('controller-top')}`, this.onBarDragStart)
      .on('click', `.${c('icon-fullscreen')}`, this.toggleFullscreen)
      .on('click', `.${c('icon-pip')}`, this.togglePip)

    this.$video.on('click', this.togglePlay)

    each(videoEvents, (event) => {
      this.video.addEventListener(
        event,
        (...args) => this.emit(event, ...args),
        false
      )
    })

    this.on('loadedmetadata', this.onLoadedMetaData)
    this.on('timeupdate', this.onTimeUpdate)
    this.on('play', this.onPlay)
    this.on('ended', this.onEnded)
    this.on('pause', this.onPause)
    this.on('canplay', this.onLoaded)
    this.on('progress', this.onLoaded)
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private onEnded = () => {
    this.seek(0)
    this.play()
  }
  private onLoadedMetaData = () => {
    this.$duration.text(
      durationFormat(Math.round(this.video.duration * 1000), 'mm:ss')
    )
  }
  private onPlay = () => {
    this.$controller.rmClass(c('active'))
    this.$play.html(`<span class="${c('icon icon-pause')}"></span>`)
  }
  private onPause = () => {
    this.$controller.addClass(c('active'))
    this.$play.html(`<span class="${c('icon icon-play')}"></span>`)
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
    this.$curTime.text(durationFormat(Math.round(currentTime * 1000), 'mm:ss'))
  }
  private appendTpl() {
    this.$container.html(stripIndent`
      <div class="${c('video')}">
        <video></video>
      </div>
      <div class="${c('controller active')}">
        <div class="${c('controller-top')}">
          <div class="${c('bar')}">
            <div class="${c('bar-loaded')}"></div>
            <div class="${c('bar-played')}">
              <span class="${c('bar-thumb')}"></span>
            </div>
          </div>
        </div>
        <div class="${c('controller-left')}">
          <div class="${c('play')}">
            <span class="${c('icon icon-play')}"></span>
          </div>
          <span class="${c('time')}">
            <span class="${c('cur-time')}">00:00</span> /
            <span class="${c('duration')}">00:00</span>
          </span>
        </div>
        <div class="${c('controller-right')}">
          <span class="${c('icon icon-pip')}"></span>
          <span class="${c('icon icon-fullscreen')}"></span>
        </div>
      </div>
    `)
  }
}
