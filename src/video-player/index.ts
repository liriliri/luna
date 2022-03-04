import $ from 'licia/$'
import each from 'licia/each'
import clamp from 'licia/clamp'
import stripIndent from 'licia/stripIndent'
import toStr from 'licia/toStr'
import durationFormat from 'licia/durationFormat'
import fullscreen from 'licia/fullscreen'
import { eventClient, drag } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'

const $document = $(document as any)

interface IOptions extends IComponentOptions {
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

export default class VideoPlayer extends Component<IOptions> {
  private $video: $.$
  private $controller: $.$
  private $curTime: $.$
  private $duration: $.$
  private $bar: $.$
  private $play: $.$
  private $barPlayed: $.$
  private $barLoaded: $.$
  private $volume: $.$
  private $volumeController: $.$
  private $volumeBarFill: $.$
  private $volumeIcon: $.$
  private video: HTMLVideoElement = document.createElement('video')
  private videoTimeUpdate = true
  private autoHideTimer: any = 0
  constructor(container: Element, options: IOptions = {}) {
    super(container, { compName: 'video-player' })

    this.initOptions(options, {
      url: '',
    })

    this.initTpl()

    this.$controller = this.find('.controller')
    this.$volume = this.find('.volume')
    this.$volumeController = this.find('.volume-controller')
    this.$volumeBarFill = this.find('.volume-bar-fill')
    this.$volumeIcon = this.$volume.find('span')
    this.$curTime = this.find('.cur-time')
    this.$duration = this.find('.duration')
    this.$play = this.find('.play')
    this.$bar = this.find('.controller-top')
    this.$barPlayed = this.find('.bar-played')
    this.$barLoaded = this.find('.bar-loaded')
    this.$video = this.find('.video')
    this.$video.get(0).appendChild(this.video)

    this.bindEvent()

    if (options.url) {
      this.video.src = options.url
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
    this.pause()
    this.$container.off('mousemove', this.onMouseMove)
    super.destroy()
  }
  seek(time: number) {
    if (!this.video.src) {
      return
    }

    time = Math.max(time, 0)
    time = Math.min(time, this.video.duration)

    this.video.currentTime = time
  }
  volume(percentage: number) {
    percentage = clamp(percentage, 0, 1)
    this.video.volume = percentage

    this.$volumeBarFill.css('width', percentage * 100 + '%')
    this.$volumeIcon.attr('class', this.c('icon icon-' + this.getVolumeIcon()))
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
  private onVolumeClick = (e: any) => {
    const { left, width } = this.$volumeController.offset()
    const clientX = eventClient('x', e.origEvent)
    this.volume((clientX - left) / (width - 5))
  }
  private onVolumeDragStart = () => {
    this.$volume.addClass(this.c('active'))
    $document.on(drag('move'), this.onVolumeDragMove)
    $document.on(drag('end'), this.onVolumeDragEnd)
  }
  private onVolumeDragMove = (e: any) => {
    this.onVolumeClick(e)
  }
  private onVolumeDragEnd = (e: any) => {
    this.$volume.rmClass(this.c('active'))
    $document.off(drag('move'), this.onVolumeDragMove)
    $document.off(drag('end'), this.onVolumeDragEnd)
    this.onVolumeClick(e)
  }
  private onMouseMove = () => {
    const { c } = this

    this.$controller.rmClass(c('controller-hidden'))
    clearTimeout(this.autoHideTimer)
    this.autoHideTimer = setTimeout(() => {
      this.$controller.addClass(c('controller-hidden'))
    }, 3000)
  }
  private bindEvent() {
    const { c } = this

    this.$controller
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.controller-top'), this.onBarClick)
      .on(drag('start'), c('.controller-top'), this.onBarDragStart)
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)
      .on('click', c('.icon-pip'), this.togglePip)
      .on('click', c('.volume-controller'), this.onVolumeClick)
      .on(drag('start'), c('.volume-controller'), this.onVolumeDragStart)

    this.$container.on('mousemove', this.onMouseMove)
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
    const { c } = this

    this.$controller.rmClass(c('active'))
    this.$play.html(c('<span class="icon icon-pause"></span>'))
  }
  private onPause = () => {
    const { c } = this

    this.$controller.addClass(c('active'))
    this.$play.html(c('<span class="icon icon-play"></span>'))
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
  private getVolumeIcon() {
    const { volume } = this.video

    if (volume === 0) {
      return 'volume-off'
    }

    if (volume < 0.5) {
      return 'volume-down'
    }

    return 'volume'
  }
  private initTpl() {
    const volumeHeight = toStr(this.video.volume * 100)

    this.$container.html(
      this.c(stripIndent`
      <div class="video"></div>
      <div class="controller active">
        <div class="controller-mask"></div>
        <div class="controller-top">
          <div class="bar">
            <div class="bar-loaded"></div>
            <div class="bar-played">
              <span class="bar-thumb"></span>
            </div>
          </div>
        </div>
        <div class="controller-left">
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
          <div class="volume">
            <span class="icon icon-${this.getVolumeIcon()}"></span>
            <div class="volume-controller">
              <div class="volume-bar">
                <div class="volume-bar-fill" style="width: ${volumeHeight}%"></div>
              </div>
            </div>
          </div>
          <span class="time">
            <span class="cur-time">00:00</span> /
            <span class="duration">00:00</span>
          </span>
        </div>
        <div class="controller-right">
          <span class="icon icon-pip"></span>
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
    `)
    )
  }
}

module.exports = VideoPlayer
module.exports.default = VideoPlayer
