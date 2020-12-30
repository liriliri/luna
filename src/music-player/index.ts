import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import { classPrefix, drag, eventClient } from '../share/util'
import each from 'licia/each'
import { splitName } from './util'
import durationFormat from 'licia/durationFormat'
import Emitter from 'licia/Emitter'
import convertBin from 'licia/convertBin'
import jsmediatags from 'jsmediatags'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import isEmpty from 'licia/isEmpty'
import random from 'licia/random'
import clamp from 'licia/clamp'
import isArr from 'licia/isArr'
import toArr from 'licia/toArr'

const c = classPrefix('music-player')
const $document = $(document as any)

interface IAudio {
  title: string
  url: string
  file?: File
  artist?: string
  cover?: string
}

const audioEvents = [
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

interface IOptions {
  audio?: IAudio | IAudio[]
}

export = class MusicPlayer extends Emitter {
  private $container: $.$
  private $body: $.$
  private $title: $.$
  private $artist: $.$
  private $curTime: $.$
  private $duration: $.$
  private $cover: $.$
  private $play: $.$
  private $bar: $.$
  private $barPlayed: $.$
  private $barLoaded: $.$
  private $volume: $.$
  private $volumeController: $.$
  private $volumeBarFill: $.$
  private $volumeIcon: $.$
  private $list: $.$
  private audioList: IAudio[] = []
  private curAudioIdx = -1
  private curAudio: IAudio | undefined
  private audio: HTMLAudioElement = new Audio()
  private loop = 'all'
  private shuffle = false
  private audioTimeUpdate = true
  constructor(container: Element, { audio }: IOptions = {}) {
    super()

    if (audio) {
      if (!isArr(audio)) {
        audio = toArr(audio)
      }
      this.audioList = audio as IAudio[]
    }

    const $container = $(container)
    $container.addClass('luna-music-player')
    this.$container = $container
    this.appendTpl()

    this.$body = $container.find(c('.body'))
    this.$title = $container.find(c('.title'))
    this.$artist = $container.find(c('.artist'))
    this.$curTime = $container.find(c('.cur-time'))
    this.$duration = $container.find(c('.duration'))
    this.$cover = $container.find(c('.cover'))
    this.$play = $container.find(c('.play'))
    this.$bar = $container.find(c('.controller-left'))
    this.$barPlayed = $container.find(c('.bar-played'))
    this.$barLoaded = $container.find(c('.bar-loaded'))
    this.$list = $container.find(c('.list'))
    this.$volume = $container.find(c('.volume'))
    this.$volumeController = $container.find(c('.volume-controller'))
    this.$volumeBarFill = $container.find(c('.volume-bar-fill'))
    this.$volumeIcon = this.$volume.find('span')

    this.bindEvent()

    if (!isEmpty(this.audioList)) {
      this.setCur(0, false)
    }
  }
  play() {
    if (!this.curAudio) {
      return
    }

    return this.audio.play()
  }
  volume(percentage: number) {
    percentage = clamp(percentage, 0, 1)
    this.audio.volume = percentage

    this.$volumeBarFill.css('height', percentage * 100 + '%')
    this.$volumeIcon.attr('class', c('icon icon-' + this.getVolumeIcon()))
  }
  pause() {
    if (!this.curAudio) {
      return
    }

    this.audio.pause()
  }
  open = async () => {
    const { audioList } = this

    const fileList = await openFile({
      accept: '.mp3,audio/*',
      multiple: true,
    })

    if (fileList.length === 0) {
      return
    }

    const curIdx = audioList.length
    each(fileList, (file) => {
      const { title, artist } = splitName(file.name)
      audioList.push({
        url: createUrl(file),
        title,
        artist,
        file,
      })
    })

    this.setCur(curIdx)
  }
  destroy() {
    this.$container.rmClass('luna-music-player')
    this.$container.html('')
    this.pause()
  }
  seek(time: number) {
    if (!this.curAudio) {
      return
    }

    time = Math.max(time, 0)
    time = Math.min(time, this.audio.duration)

    this.audio.currentTime = time
  }
  next() {
    if (isEmpty(this.audioList)) {
      return
    }

    let idx = this.curAudioIdx
    const len = this.audioList.length
    if (this.shuffle) {
      idx = random(0, len - 1)
    } else {
      idx++
      if (idx >= len) {
        idx = 0
      }
    }

    this.setCur(idx)
  }
  private getVolumeIcon() {
    const { volume } = this.audio

    if (volume === 0) {
      return 'volume-off'
    }

    if (volume < 0.5) {
      return 'volume-down'
    }

    return 'volume'
  }
  private togglePlay = () => {
    if (this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
  private toggleShuffle = (e: any) => {
    this.shuffle = !this.shuffle

    $(e.curTarget).attr(
      'class',
      c('icon icon-shuffle' + (this.shuffle ? '' : '-disabled') + ' shuffle')
    )
  }
  private setCur(idx: number, autoplay = true) {
    const { audio, audioList } = this

    this.curAudioIdx = idx
    this.curAudio = audioList[idx]
    audio.src = this.curAudio.url
    audio.load()

    this.updateInfo()
    this.renderList()

    if (autoplay) {
      this.play()
    }
  }
  private onVolumeClick = (e: any) => {
    const { top, height } = this.$volumeController.offset()
    const clientY = eventClient('y', e.origEvent)
    this.volume(1 - (clientY - top) / (height - 5))
  }
  private onBarClick = (e: any) => {
    const time = this.getBarClickTime(e)
    this.seek(time)
    this.updateTimeUi(time)
  }
  private getBarClickTime(e: any) {
    const { left, width } = this.$bar.offset()
    const percent = clamp((eventClient('x', e.origEvent) - left) / width, 0, 1)
    return percent * this.audio.duration
  }
  private renderList() {
    let html = ''

    each(this.audioList, (audio, idx) => {
      html += stripIndent`
        <div class="${c(
          'list-item' + (audio === this.curAudio ? ' active' : '')
        )}" data-idx="${toStr(idx)}">
          <span class="${c('list-idx')}">${idx + 1}</span>
          <span class="${c('list-title')}">${audio.title}</span>
          <span class="${c('list-artist')}">${audio.artist}</span>
        </div>
      `
    })

    this.$list.html(html)
  }
  private updateInfo() {
    if (!this.curAudio) {
      return
    }

    const { title, artist, cover } = this.curAudio

    this.$title.text(title)
    this.$artist.text(artist ? ` - ${artist}` : '')
    this.$cover.css('background-image', cover ? `url(${cover})` : 'none')
  }
  private onListItemClick = (e: any) => {
    const idx = toNum($(e.curTarget).data('idx'))

    this.setCur(idx)
  }
  private toggleList = () => {
    const { $list } = this
    const { height } = $list.offset()
    $list.css('height', height > 0 ? '0' : 'auto')
  }
  private onLoopClick = (e: any) => {
    let { loop } = this
    switch (loop) {
      case 'all':
        loop = 'one'
        break
      case 'one':
        loop = 'off'
        break
      case 'off':
        loop = 'all'
        break
    }
    this.loop = loop
    $(e.curTarget).attr('class', c(`icon icon-loop-${loop} loop`))
  }
  private onBarDragStart = () => {
    this.audioTimeUpdate = false
    $document.on(drag('move'), this.onBarDragMove)
    $document.on(drag('end'), this.onBarDragEnd)
  }
  private onBarDragMove = (e: any) => {
    this.updateTimeUi(this.getBarClickTime(e))
  }
  private onBarDragEnd = (e: any) => {
    $document.off(drag('move'), this.onBarDragMove)
    $document.off(drag('end'), this.onBarDragEnd)
    this.audioTimeUpdate = true
    this.onBarClick(e)
  }
  private onVolumeDragStart = () => {
    this.$volume.addClass(c('active'))
    $document.on(drag('move'), this.onVolumeDragMove)
    $document.on(drag('end'), this.onVolumeDragEnd)
  }
  private onVolumeDragMove = (e: any) => {
    this.onVolumeClick(e)
  }
  private onVolumeDragEnd = (e: any) => {
    this.$volume.rmClass(c('active'))
    $document.off(drag('move'), this.onVolumeDragMove)
    $document.off(drag('end'), this.onVolumeDragEnd)
    this.onVolumeClick(e)
  }
  private bindEvent() {
    this.$body
      .on('click', c('.icon-file'), this.open)
      .on('click', c('.icon-list'), this.toggleList)
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.loop'), this.onLoopClick)
      .on('click', c('.shuffle'), this.toggleShuffle)
      .on('click', c('.controller-left'), this.onBarClick)
      .on(drag('start'), c('.controller-left'), this.onBarDragStart)
      .on('click', c('.volume-controller'), this.onVolumeClick)
      .on(drag('start'), c('.volume-controller'), this.onVolumeDragStart)

    this.$list.on('click', c('.list-item'), this.onListItemClick)

    each(audioEvents, (event) => {
      this.audio.addEventListener(
        event,
        (...args) => {
          this.emit(event, ...args)
        },
        false
      )
    })

    this.on('loadedmetadata', this.onLoadedMetaData)
    this.on('timeupdate', this.onTimeUpdate)
    this.on('play', this.onPlay)
    this.on('pause', this.onPause)
    this.on('ended', this.onEnded)
    this.on('canplay', this.onLoaded)
    this.on('progress', this.onLoaded)
  }
  private onLoaded = () => {
    const { audio } = this
    let percent = 0
    const len = audio.buffered.length
    if (len) {
      percent = (audio.buffered.end(len - 1) / audio.duration) * 100
    }

    this.$barLoaded.css('width', percent.toFixed(2) + '%')
  }
  private onEnded = () => {
    switch (this.loop) {
      case 'off':
        this.seek(0)
        break
      case 'one':
        this.seek(0)
        this.play()
        break
      case 'all':
        this.next()
        break
    }
  }
  private onPlay = () => {
    this.$play.html(`<span class="${c('icon icon-pause')}"></span>`)
  }
  private onPause = () => {
    this.$play.html(`<span class="${c('icon icon-play')}"></span>`)
  }
  private onTimeUpdate = () => {
    if (this.audioTimeUpdate) {
      this.updateTimeUi(this.audio.currentTime)
    }
  }
  private updateTimeUi(currentTime: number) {
    const percent = (currentTime / this.audio.duration) * 100
    this.$barPlayed.css('width', percent.toFixed(2) + '%')
    this.$curTime.text(durationFormat(Math.round(currentTime * 1000), 'mm:ss'))
  }
  private onLoadedMetaData = () => {
    if (this.curAudio) {
      const { file, url, cover } = this.curAudio
      if (!cover) {
        jsmediatags.read(file || url, {
          onSuccess: (tag) => {
            const { curAudio } = this
            if (!curAudio) {
              return
            }
            const { picture, title, artist } = tag.tags
            if (title) {
              if (file || !curAudio.title) {
                curAudio.title = title
              }
            }
            if (artist) {
              if (file || !curAudio.artist) {
                curAudio.artist = artist
              }
            }

            if (picture) {
              if (file || !curAudio.cover) {
                const blob = convertBin(picture.data, 'Blob')
                curAudio.cover = createUrl(blob)
              }
            }

            this.updateInfo()
          },
        })
      }
    }
    this.$duration.text(
      durationFormat(Math.round(this.audio.duration * 1000), 'mm:ss')
    )
  }
  private appendTpl() {
    const volumeHeight = toStr(this.audio.volume * 100)

    this.$container.html(stripIndent`
      <div class="${c('body')}">
        <div class="${c('body-left cover')}">
          <div class="${c('play')}">
            <span class="${c('icon icon-play')}"></span>
          </div>
        </div>
        <div class="${c('body-right')}">
          <div class="${c('info')}">
            <span class="${c('title')}">Title</span>
            <span class="${c('artist')}"> - Artist</span>
          </div>
          <div class="${c('controller')}">
            <div class="${c('controller-left')}">
              <div class="${c('bar')}">
                <div class="${c('bar-loaded')}"></div>
                <div class="${c('bar-played')}">
                  <span class="${c('bar-thumb')}"></span>
                </div>
              </div>
            </div>
            <div class="${c('controller-right')}">
              <span class="${c('time')}">
                <span class="${c('cur-time')}">00:00</span> /
                <span class="${c('duration')}">00:00</span>
              </span>
              <div class="${c('volume')}">
                <span class="${c('icon icon-' + this.getVolumeIcon())}"></span>
                <div class="${c('volume-controller')}">
                  <div class="${c('volume-bar')}">
                    <div class="${c(
                      'volume-bar-fill'
                    )}" style="height: ${volumeHeight}%"></div>
                  </div>
                </div>
              </div>
              <span class="${c(
                'icon icon-shuffle' +
                  (this.shuffle ? '' : '-disabled') +
                  ' shuffle'
              )}"></span>
              <span class="${c(
                'icon icon-loop-' + this.loop + ' loop'
              )}"></span>
              <span class="${c('icon icon-file')}"></span>
              <span class="${c('icon icon-list')}"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="${c('list')}"></div>
    `)
  }
}
