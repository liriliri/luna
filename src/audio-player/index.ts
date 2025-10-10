import { eventPage, exportCjs, mediaDurationFormat } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'
import WaveSurfer from 'wavesurfer.js'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import pointerEvent from 'licia/pointerEvent'
import clamp from 'licia/clamp'
import escape from 'licia/escape'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Audio url. */
  url: string
  /** Audio name. */
  name?: string
  /** Wave color. */
  waveColor?: string
  /** Wave height. */
  waveHeight?: number
  /** Progress color. */
  progressColor?: string
}

/**
 * Audio player.
 *
 * @example
 * const audioPlayer = new LunaAudioPlayer(container, { url: 'https://luna.liriliri.io/Get_along.mp3' })
 * audioPlayer.play()
 */
export default class AudioPlayer extends Component<IOptions> {
  private $play: $.$
  private $curTime: $.$
  private $duration: $.$
  private $volume: $.$
  private $volumeController: $.$
  private $volumeBarFill: $.$
  private $volumeIcon: $.$
  private $name: $.$
  private wavesurfer: WaveSurfer
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'audio-player' }, options)

    this.initOptions(options, {
      waveColor: '#ccc',
      progressColor: '#1a73e8',
      waveHeight: 60,
      name: '',
    })

    this.initTpl()

    this.$play = this.find('.play')
    this.$duration = this.find('.duration')
    this.$curTime = this.find('.cur-time')
    this.$volume = this.find('.volume')
    this.$volumeController = this.find('.volume-controller')
    this.$volumeBarFill = this.find('.volume-bar-fill')
    this.$volumeIcon = this.$volume.find('span')
    this.$name = this.find('.name')

    const $wavesurfer = this.find('.wavesurfer')

    this.wavesurfer = WaveSurfer.create({
      height: this.options.waveHeight,
      container: $wavesurfer.get(0) as HTMLElement,
      waveColor: this.options.waveColor,
      progressColor: this.options.progressColor,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
    })

    this.wavesurfer.load(this.options.url)

    this.bindEvent()
  }
  /** Play audio. */
  play() {
    this.wavesurfer.play()
    this.renderPlayIcon()
  }
  /** Pause audio. */
  pause() {
    this.wavesurfer.pause()
    this.renderPlayIcon()
  }
  private renderVolume() {
    const volume = this.wavesurfer.getVolume()
    let icon = 'volume'
    if (volume === 0) {
      icon = 'volume-off'
    }
    if (volume < 0.5) {
      icon = 'volume-down'
    }

    this.$volumeBarFill.css('width', volume * 100 + '%')
    this.$volumeIcon.attr('class', this.c('icon icon-' + icon))
  }
  private togglePlay = () => {
    const { wavesurfer } = this

    wavesurfer.playPause()
    this.renderPlayIcon()
  }
  private onVolumeClick = (e: any) => {
    const { left, width } = this.$volumeController.offset()
    const pageX = eventPage('x', e.origEvent)
    this.wavesurfer.setVolume(clamp((pageX - left) / (width - 5), 0, 1))
    this.renderVolume()
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
  private renderPlayIcon() {
    const { $play, c } = this

    if (this.wavesurfer.isPlaying()) {
      $play.html(c('<span class="icon icon-pause"></span>'))
    } else {
      $play.html(c('<span class="icon icon-play"></span>'))
    }
  }
  private initTpl() {
    const volume = `<div class="volume">
      <span class="icon icon-volume-off"></span>
      <div class="volume-controller">
        <div class="volume-bar">
          <div class="volume-bar-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>`

    this.$container.html(
      this.c(stripIndent`
      <div class="wavesurfer"></div>
      <div class="controller">
        <div class="controller-left">
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
          ${volume}
        </div>
        <div class="name">${escape(this.options.name)}</div>
        <div class="controller-right">
          <span class="cur-time">00:00</span> /
          <span class="duration">00:00</span>
        </div>
      </div>`)
    )
  }
  private bindEvent() {
    const { c, wavesurfer } = this

    this.$container
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.volume-controller'), this.onVolumeClick)
      .on(pointerEvent('down'), c('.volume-controller'), this.onVolumeDragStart)

    wavesurfer.on('finish', () => {
      this.renderPlayIcon()
    })
    wavesurfer.on('ready', () => {
      this.renderVolume()
      this.$duration.text(mediaDurationFormat(wavesurfer.getDuration()))
    })
    wavesurfer.on('audioprocess', () => {
      this.$curTime.text(mediaDurationFormat(wavesurfer.getCurrentTime()))
    })

    this.on('changeOption', (name, val) => {
      switch (name) {
        case 'url':
          wavesurfer.load(val)
          this.pause()
          wavesurfer.seekTo(0)
          break
        case 'name':
          this.$name.text(val)
          break
      }
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, AudioPlayer)
}
