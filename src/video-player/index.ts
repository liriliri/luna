import $ from 'licia/$'
import Emitter from 'licia/Emitter'
import stripIndent from 'licia/stripIndent'
import { classPrefix } from '../share/util'

const c = classPrefix('video-player')

interface IOptions {
  url?: string
}

export = class VideoPlayer extends Emitter {
  private $container: $.$
  private $video: $.$
  private video: HTMLVideoElement
  constructor(container: Element, { url = '' }: IOptions = {}) {
    super()

    const $container = $(container)
    $container.addClass('luna-video-player')
    this.$container = $container
    this.appendTpl()

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
  private togglePlay = () => {
    if (this.video.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
  private bindEvent() {
    this.$video.on('click', this.togglePlay)
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
