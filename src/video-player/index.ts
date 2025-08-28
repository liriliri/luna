import $ from 'licia/$'
import h from 'licia/h'
import download from 'licia/download'
import each from 'licia/each'
import detectBrowser from 'licia/detectBrowser'
import clamp from 'licia/clamp'
import isMobile from 'licia/isMobile'
import stripIndent from 'licia/stripIndent'
import toStr from 'licia/toStr'
import durationFormat from 'licia/durationFormat'
import fullscreen from 'licia/fullscreen'
import hotkey from 'licia/hotkey'
import pointerEvent from 'licia/pointerEvent'
import { eventPage, exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'
import ResizeSensor from 'licia/ResizeSensor'
import nextTick from 'licia/nextTick'
import isNaN from 'licia/isNaN'

const $document = $(document as any)
const isIos = detectBrowser(navigator.userAgent).name === 'ios'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Video url. */
  url?: string
  /** Enable hotkey. */
  hotkey?: boolean
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

/**
 * Elegant HTML5 video player.
 *
 * @example
 * const videoPlayer = new LunaVideoPlayer(container, {
 *   url: 'https://api.dogecloud.com/player/get.mp4?vcode=9dbb405e2141b5e8&userId=2096&flsign=1c02d5e60d2a0f29e1fd2ec0c0762b8b&ext=.mp4',
 * })
 *
 * videoPlayer.play()
 */
export default class VideoPlayer extends Component<IOptions> {
  private $video: $.$
  private $controller: $.$
  private $time: $.$
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
  private resizeSensor: ResizeSensor
  constructor(container: Element, options: IOptions = {}) {
    super(container, { compName: 'video-player' })

    this.initOptions(options, {
      url: '',
      hotkey: true,
    })

    const { video } = this

    this.initTpl()

    this.$controller = this.find('.controller')
    this.$volume = this.find('.volume')
    this.$volumeController = this.find('.volume-controller')
    this.$volumeBarFill = this.find('.volume-bar-fill')
    this.$volumeIcon = this.$volume.find('span')
    this.$time = this.find('.time')
    this.$curTime = this.find('.cur-time')
    this.$duration = this.find('.duration')
    this.$play = this.find('.play')
    this.$bar = this.find('.controller-top')
    this.$barPlayed = this.find('.bar-played')
    this.$barLoaded = this.find('.bar-loaded')
    this.$video = this.find('.video')
    this.$video.get(0).appendChild(video)

    video.crossOrigin = 'anonymous'
    video.setAttribute('playsinline', 'true')

    this.resizeSensor = new ResizeSensor(this.container)
    this.bindEvent()

    if (options.url) {
      this.video.src = options.url
    }
  }
  /** Play video. */
  play() {
    if (!this.video.src) {
      return
    }

    return this.video.play()
  }
  /** Pause video. */
  pause() {
    if (!this.video.src) {
      return
    }

    this.video.pause()
  }
  destroy() {
    this.pause()
    this.resizeSensor.destroy()
    this.$container.off('mousemove', this.onMouseMove)
    super.destroy()
  }
  /** Seek to specified time. */
  seek(time: number) {
    if (!this.video.src) {
      return
    }

    const { video } = this

    const duration = !isNaN(video.duration) ? video.duration : 0

    time = Math.max(time, 0)
    time = Math.min(time, duration)

    this.video.currentTime = time
    this.updateTimeUi(time)
  }
  /** Set video volume. */
  volume(percentage: number) {
    percentage = clamp(percentage, 0, 1)
    this.video.volume = percentage

    this.$volumeBarFill.css('width', percentage * 100 + '%')
    this.$volumeIcon.attr('class', this.c('icon icon-' + this.getVolumeIcon()))
  }
  private captureScreenshot = () => {
    const { video } = this

    const canvas = h('canvas') as HTMLCanvasElement
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) {
        return
      }
      download(blob, 'screenshot.png', 'image/png')
    })
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
    const pageX = eventPage('x', e.origEvent)
    this.volume((pageX - left) / (width - 5))
  }
  private onVolumeDragStart = () => {
    this.$volume.addClass(this.c('active'))
    $document.on(pointerEvent('move'), this.onVolumeDragMove)
    $document.on(pointerEvent('up'), this.onVolumeDragEnd)
  }
  private onVolumeDragMove = (e: any) => {
    this.onVolumeClick(e)
  }
  private onVolumeDragEnd = (e: any) => {
    this.$volume.rmClass(this.c('active'))
    $document.off(pointerEvent('move'), this.onVolumeDragMove)
    $document.off(pointerEvent('up'), this.onVolumeDragEnd)
    this.onVolumeClick(e)
  }
  private onMouseMove = () => {
    const { c, $container } = this

    $container.rmClass(c('controller-hidden'))
    clearTimeout(this.autoHideTimer)
    this.autoHideTimer = setTimeout(() => {
      $container.addClass(c('controller-hidden'))
    }, 3000)
  }
  private onResize = () => {
    const offset = this.$container.offset()
    const hidden = this.c('hidden')
    const { $time, $volume } = this
    if (offset.width < 320) {
      $volume.addClass(hidden)
      $time.addClass(hidden)
    } else {
      $volume.rmClass(hidden)
      $time.rmClass(hidden)
    }
  }
  private bindEvent() {
    const { c, container, $container } = this

    this.$controller
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.controller-top'), this.onBarClick)
      .on(pointerEvent('down'), c('.controller-top'), this.onBarDragStart)
      .on('click', c('.icon-fullscreen'), this.toggleFullscreen)
      .on('click', c('.icon-pip'), this.togglePip)
      .on('click', c('.icon-camera'), this.captureScreenshot)
      .on('click', c('.volume-controller'), this.onVolumeClick)
      .on(pointerEvent('down'), c('.volume-controller'), this.onVolumeDragStart)

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

    this.resizeSensor.addListener(this.onResize)
    this.onResize()

    this.on('changeOption', (name, val) => {
      switch (name) {
        case 'url':
          this.pause()
          this.seek(0)
          nextTick(() => {
            this.video.src = val
            this.video.load()
          })
          break
      }
    })

    if (this.options.hotkey) {
      $container.attr('tabindex', '-1')
      const options = { element: container }
      hotkey.on('space', options, this.togglePlay)
      hotkey.on('left', options, () => {
        this.seek(this.video.currentTime - 5)
      })
      hotkey.on('right', options, () => {
        this.seek(this.video.currentTime + 5)
      })
      hotkey.on('up', options, () => {
        this.volume(this.video.volume + 0.1)
      })
      hotkey.on('down', options, () => {
        this.volume(this.video.volume - 0.1)
      })
    }
  }
  private toggleFullscreen = () => {
    const { video } = this as any

    if (isIos && video.webkitEnterFullScreen) {
      video.webkitEnterFullScreen()
    } else {
      fullscreen.toggle(this.container)
    }
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
    $document.on(pointerEvent('move'), this.onBarDragMove)
    $document.on(pointerEvent('up'), this.onBarDragEnd)
  }
  private onBarDragMove = (e: any) => {
    this.updateTimeUi(this.getBarClickTime(e))
  }
  private onBarDragEnd = (e: any) => {
    $document.off(pointerEvent('move'), this.onBarDragMove)
    $document.off(pointerEvent('up'), this.onBarDragEnd)
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
    const percent = clamp((eventPage('x', e.origEvent) - left) / width, 0, 1)
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
    const volumeWidth = toStr(this.video.volume * 100)

    let volume = ''
    if (!isMobile()) {
      volume = `<div class="volume">
        <span class="icon icon-${this.getVolumeIcon()}"></span>
        <div class="volume-controller">
          <div class="volume-bar">
            <div class="volume-bar-fill" style="width: ${volumeWidth}%"></div>
          </div>
        </div>
      </div>`
    }

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
          ${volume} 
          <span class="time">
            <span class="cur-time">00:00</span> /
            <span class="duration">00:00</span>
          </span>
        </div>
        <div class="controller-right">
          ${isMobile() ? '' : '<span class="icon icon-camera"></span>'}
          <span class="icon icon-pip"></span>
          <span class="icon icon-fullscreen"></span>
        </div>
      </div>
    `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, VideoPlayer)
}
