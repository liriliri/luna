import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import { exportCjs, eventPage } from '../share/util'
import each from 'licia/each'
import pointerEvent from 'licia/pointerEvent'
import durationFormat from 'licia/durationFormat'
import convertBin from 'licia/convertBin'
import jsmediatags from 'jsmediatags'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import isEmpty from 'licia/isEmpty'
import random from 'licia/random'
import clamp from 'licia/clamp'
import isArr from 'licia/isArr'
import toArr from 'licia/toArr'
import Component, { IComponentOptions } from '../share/Component'
import ResizeSensor from 'licia/ResizeSensor'
import contain from 'licia/contain'
import splitPath from 'licia/splitPath'
import nextTick from 'licia/nextTick'
import isNaN from 'licia/isNaN'

const $document = $(document as any)

/** IAudio */
export interface IAudio {
  /** Audio title. */
  title: string
  /** Audio src. */
  url: string
  file?: File
  /** Audio artist. */
  artist?: string
  /** Audio cover. */
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

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Audio list. */
  audio?: IAudio | IAudio[]
  /** Whether list should folded at first. */
  listFolded?: boolean
}

/**
 * Music player with playlist support.
 *
 * @example
 * const musicPlayer = new LunaMusicPlayer(container, {
 *   audio: {
 *     url: 'https://luna.liriliri.io/Get_along.mp3',
 *     cover: 'https://luna.liriliri.io/Get_along.jpg',
 *     title: 'Get Along',
 *     artist: '林原めぐみ',
 *   }
 * })
 * musicPlayer.play()
 */
export default class MusicPlayer extends Component<IOptions> {
  private audio: HTMLAudioElement = new Audio()
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
  private loop = 'all'
  private shuffle = false
  private audioTimeUpdate = true
  private resizeSensor: ResizeSensor
  constructor(container: Element, options: IOptions = {}) {
    super(container, { compName: 'music-player' }, options)

    this.initOptions(options, {
      listFolded: false,
    })

    this.initTpl()

    this.$body = this.find('.body')
    this.$title = this.find('.title')
    this.$artist = this.find('.artist')
    this.$curTime = this.find('.cur-time')
    this.$duration = this.find('.duration')
    this.$cover = this.find('.cover')
    this.$play = this.find('.play')
    this.$bar = this.find('.controller-left')
    this.$barPlayed = this.find('.bar-played')
    this.$barLoaded = this.find('.bar-loaded')
    this.$list = this.find('.list')
    this.$volume = this.find('.volume')
    this.$volumeController = this.find('.volume-controller')
    this.$volumeBarFill = this.find('.volume-bar-fill')
    this.$volumeIcon = this.$volume.find('span')

    this.resizeSensor = new ResizeSensor(this.container)
    this.bindEvent()

    this.initAudio(this.options.audio)

    if (this.options.listFolded) {
      this.$list.addClass(this.c('hidden'))
    }
  }
  getAudio() {
    return this.audio
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
    this.$volumeIcon.attr('class', this.c('icon icon-' + this.getVolumeIcon()))
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
    this.pause()
    this.resizeSensor.destroy()
    super.destroy()
  }
  seek(time: number) {
    if (!this.curAudio) {
      return
    }

    const { audio } = this

    const duration = !isNaN(audio.duration) ? audio.duration : 0

    time = Math.max(time, 0)
    time = Math.min(time, duration)

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
  private initAudio(audio: IAudio | IAudio[]) {
    if (audio) {
      if (!isArr(audio)) {
        audio = toArr(audio)
      }
      this.audioList = audio as IAudio[]
    }
    each(this.audioList, (audio) => {
      if (!audio.artist) {
        const { title, artist } = splitName(audio.title)
        audio.artist = artist
        audio.title = title
      }
    })
    if (!isEmpty(this.audioList)) {
      this.setCur(0, false)
    }
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
      this.c(
        'icon icon-shuffle' + (this.shuffle ? '' : '-disabled') + ' shuffle'
      )
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
    const pageY = eventPage('y', e.origEvent)
    this.volume(1 - (pageY - top) / (height - 5))
  }
  private onBarClick = (e: any) => {
    const time = this.getBarClickTime(e)
    this.seek(time)
    this.updateTimeUi(time)
  }
  private getBarClickTime(e: any) {
    const { left, width } = this.$bar.offset()
    const percent = clamp((eventPage('x', e.origEvent) - left) / width, 0, 1)
    return percent * this.audio.duration
  }
  private renderList() {
    const { $list } = this

    let html = ''

    const hidden = this.c('hidden')
    const $iconList = this.find('.icon-music-list')
    const $iconShuffle = this.find('.shuffle')
    if (this.audioList.length < 2) {
      $list.addClass(hidden)
      $iconList.addClass(hidden)
      $iconShuffle.addClass(hidden)
    } else {
      $list.rmClass(hidden)
      $iconList.rmClass(hidden)
      $iconShuffle.rmClass(hidden)
    }

    each(this.audioList, (audio, idx) => {
      html += this.c(stripIndent`
        <div class="list-item${
          audio === this.curAudio ? ' active' : ''
        }" data-idx="${toStr(idx)}">
          <span class="list-idx">${idx + 1}</span>
          <span class="list-title">${audio.title}</span>
          <span class="list-artist">${audio.artist}</span>
        </div>
      `)
    })

    $list.html(html)
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
    this.$list.toggleClass(this.c('hidden'))
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
    $(e.curTarget).attr('class', this.c(`icon icon-loop-${loop} loop`))
  }
  private onBarDragStart = () => {
    this.audioTimeUpdate = false
    $document.on(pointerEvent('move'), this.onBarDragMove)
    $document.on(pointerEvent('up'), this.onBarDragEnd)
  }
  private onBarDragMove = (e: any) => {
    this.updateTimeUi(this.getBarClickTime(e))
  }
  private onBarDragEnd = (e: any) => {
    $document.off(pointerEvent('move'), this.onBarDragMove)
    $document.off(pointerEvent('up'), this.onBarDragEnd)
    this.audioTimeUpdate = true
    this.onBarClick(e)
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
  private bindEvent() {
    const { c } = this
    this.$body
      .on('click', c('.icon-file'), this.open)
      .on('click', c('.icon-music-list'), this.toggleList)
      .on('click', c('.play'), this.togglePlay)
      .on('click', c('.loop'), this.onLoopClick)
      .on('click', c('.shuffle'), this.toggleShuffle)
      .on('click', c('.controller-left'), this.onBarClick)
      .on(pointerEvent('down'), c('.controller-left'), this.onBarDragStart)
      .on('click', c('.volume-controller'), this.onVolumeClick)
      .on(pointerEvent('down'), c('.volume-controller'), this.onVolumeDragStart)

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

    this.resizeSensor.addListener(this.onResize)
    this.onResize()

    this.on('changeOption', (name) => {
      switch (name) {
        case 'audio':
          this.pause()
          this.seek(0)
          nextTick(() => {
            this.initAudio(this.options.audio)
          })
          break
      }
    })
  }
  private onResize = () => {
    const offset = this.$container.offset()
    const $iconFile = this.find('.icon-file')
    const $time = this.find('.time')
    const hidden = this.c('hidden')
    if (offset.width < 320) {
      $iconFile.addClass(hidden)
      $time.addClass(hidden)
    } else {
      $iconFile.rmClass(hidden)
      $time.rmClass(hidden)
    }
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
    this.$play.html(this.c('<span class="icon icon-pause"></span>'))
  }
  private onPause = () => {
    this.$play.html(this.c('<span class="icon icon-play"></span>'))
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
    const { curAudio } = this
    if (curAudio) {
      const { file, url, cover } = curAudio
      if (!cover) {
        jsmediatags.read(file || url, {
          onSuccess: (tag) => {
            if (curAudio !== this.curAudio) {
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
            this.renderList()
          },
        })
      }
    }
    this.$duration.text(
      durationFormat(Math.round(this.audio.duration * 1000), 'mm:ss')
    )
  }
  private initTpl() {
    const volumeHeight = toStr(this.audio.volume * 100)

    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <div class="body-left cover">
          <div class="play">
            <span class="icon icon-play"></span>
          </div>
        </div>
        <div class="body-right">
          <div class="info">
            <span class="title">Title</span>
            <span class="artist"> - Artist</span>
          </div>
          <div class="controller">
            <div class="controller-left">
              <div class="bar">
                <div class="bar-loaded"></div>
                <div class="bar-played">
                  <span class="bar-thumb"></span>
                </div>
              </div>
            </div>
            <div class="controller-right">
              <span class="time">
                <span class="cur-time">00:00</span> /
                <span class="duration">00:00</span>
              </span>
              <div class="volume">
                <span class="icon icon-${this.getVolumeIcon()}"></span>
                <div class="volume-controller">
                  <div class="volume-bar">
                    <div class="volume-bar-fill" style="height: ${volumeHeight}%"></div>
                  </div>
                </div>
              </div>
              <span class="icon icon-shuffle${
                this.shuffle ? '' : '-disabled'
              } shuffle"></span>
              <span class="icon icon-loop-${this.loop} loop"></span>
              <span class="icon icon-file"></span>
              <span class="icon icon-music-list"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="list"></div>
    `)
    )
  }
}

function splitName(str: string) {
  const { name, ext } = splitPath(str)

  if (contain(name, ' - ')) {
    const parts = name.replace(ext, '').split(' - ')
    return {
      title: parts[1],
      artist: parts[0],
    }
  }

  return {
    title: name,
    artist: '',
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, MusicPlayer)
}
