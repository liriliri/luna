import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import openFile from 'licia/openFile'
import createUrl from 'licia/createUrl'
import { classPrefix } from '../share/util'
import each from 'licia/each'
import { splitName } from './util'
import durationFormat from 'licia/durationFormat'
import Emitter from 'licia/Emitter'
import convertBin from 'licia/convertBin'
import jsmediatags from 'jsmediatags'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'

const c = classPrefix('music-player')

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
  private $list: $.$
  private audioList: IAudio[] = []
  private curAudio: IAudio | undefined
  private audio: HTMLAudioElement = new Audio()
  private loop: string = 'all'
  constructor(container: Element) {
    super()

    const $container = $(container)
    $container.addClass('luna-music-player')
    this.$container = $container
    this.appendTpl()

    this.$body = $container.find(`.${c('body')}`)
    this.$title = $container.find(`.${c('title')}`)
    this.$artist = $container.find(`.${c('artist')}`)
    this.$curTime = $container.find(`.${c('cur-time')}`)
    this.$duration = $container.find(`.${c('duration')}`)
    this.$cover = $container.find(`.${c('cover')}`)
    this.$play = $container.find(`.${c('play')}`)
    this.$barPlayed = $container.find(`.${c('bar-played')}`)
    this.$bar = $container.find(`.${c('controller-left')}`)
    this.$list = $container.find(`.${c('list')}`)

    this.bindEvent()
  }
  play = () => {
    if (!this.curAudio) {
      return
    }

    this.audio.play()
  }
  pause = () => {
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
  private togglePlay = () => {
    if (this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
  private setCur(idx: number) {
    const { audio, audioList } = this

    this.curAudio = audioList[idx]
    audio.src = this.curAudio.url
    audio.load()

    this.updateInfo()
    this.renderList()

    this.play()
  }
  private onBarClick = (e: any) => {
    e = e.origEvent
    const clientX = e.clientX || e.changedTouches[0].clientX
    const { left, width } = this.$bar.offset()
    this.seek(((clientX - left) / width) * this.audio.duration)
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
    this.$bar.on('click', this.onBarClick)
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
        console.log('lalal')
        loop = 'off'
        break
      case 'off':
        loop = 'all'
        break
    }
    this.loop = loop
    $(e.curTarget).attr('class', c(`icon icon-loop-${loop} loop`))
  }
  private bindEvent() {
    this.$body
      .on('click', `.${c('icon-file')}`, this.open)
      .on('click', `.${c('icon-list')}`, this.toggleList)
      .on('click', `.${c('play')}`, this.togglePlay)
      .on('click', `.${c('loop')}`, this.onLoopClick)
    this.$list.on('click', `.${c('list-item')}`, this.onListItemClick)

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
  }
  private onPlay = () => {
    this.$play.html(`<span class="${c('icon icon-pause')}"></span>`)
  }
  private onPause = () => {
    this.$play.html(`<span class="${c('icon icon-play')}"></span>`)
  }
  private onTimeUpdate = () => {
    const { currentTime, duration } = this.audio
    const percent = (currentTime / duration) * 100
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
