import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import LunaCarousel from 'luna-carousel'
import LunaImageViewer from 'luna-image-viewer'
import LunaToolbar, { LunaToolbarButton, LunaToolbarText } from 'luna-toolbar'
import h from 'licia/h'
import $ from 'licia/$'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import types from 'licia/types'
import each from 'licia/each'
import loadImg from 'licia/loadImg'
import fullscreen from 'licia/fullscreen'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Enable inline mode. */
  inline?: boolean
}

/**
 * Lightweight gallery.
 *
 * @example
 * const gallery = new LunaGallery(container)
 * gallery.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
 * gallery.show()
 */
export default class Gallery extends Component<IOptions> {
  private onResize: () => void
  private carousel: LunaCarousel
  private images: Image[] = []
  private resizeSensor: ResizeSensor
  private isCycling = false
  private counter: LunaToolbarText
  private playBtn: LunaToolbarButton
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'gallery' })
    this.initOptions(options, {
      inline: false,
    })

    if (!this.options.inline) {
      this.$container.addClass(this.c('full'))
    }

    this.initTpl()

    const $body = this.find('.body')
    const body = $body.get(0) as HTMLElement

    this.carousel = new LunaCarousel(body)
    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this.reset(), 16)
    this.initToolbar()

    this.bindEvent()
    this.hide()
  }
  show() {
    const { c } = this
    $(document.body).addClass(c('no-scrollbar'))
    this.$container.rmClass(c('hidden'))
    this.reset()
  }
  hide = () => {
    const { c } = this
    this.pause()
    if (fullscreen.isActive()) {
      this.toggleFullscreen()
    }
    $(document.body).rmClass(c('no-scrollbar'))
    this.$container.addClass(c('hidden'))
  }
  /** Slide to the item at given index. */
  slideTo(idx: number) {
    this.carousel.slideTo(idx)
  }
  /** Clear all images. */
  clear() {
    this.images = []
    this.carousel.clear()
    this.updateCounter()
  }
  /** Append image. */
  append(src: string, title?: string) {
    this.insert(this.images.length, src, title)
  }
  /** Insert image at given position. */
  insert(pos: number, src: string, title?: string) {
    const { images } = this
    const image = new Image(this, src, title)
    const len = images.length
    if (pos > len - 1) {
      images.push(image)
    } else {
      images.splice(pos, 0, image)
    }
    this.carousel.insert(pos, image.container)
    this.updateCounter()

    if (this.carousel.getActiveIdx() === pos) {
      image.load()
    }
  }
  reset() {
    each(this.images, (image) => image.reset())
  }
  cycle() {
    const { carousel, c, playBtn } = this
    carousel.setOption('interval', 5000)
    carousel.cycle()
    const $playIcon = playBtn.$container.find(c('.icon'))
    $playIcon.rmClass(c('icon-play')).addClass(c('icon-pause'))
    this.isCycling = true
  }
  pause() {
    const { c, playBtn } = this
    this.carousel.pause()
    const $playIcon = playBtn.$container.find(c('.icon'))
    $playIcon.addClass(c('icon-play')).rmClass(c('icon-pause'))
    this.isCycling = false
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
    this.$container.rmClass(this.c('hidden'))
  }
  private toggleCycle = () => {
    if (this.isCycling) {
      this.pause()
    } else {
      this.cycle()
    }
  }
  private initToolbar() {
    const { c } = this
    const $toolbar = this.find('.toolbar')
    const toolbar = new LunaToolbar($toolbar.get(0) as HTMLElement, {
      theme: 'dark',
    })
    function appendIcon(icon: string, handler: types.AnyFn) {
      const el = h(`span${c('.icon') + c(`.icon-${icon}`)}`)
      return toolbar.appendButton(el, handler)
    }
    this.counter = toolbar.appendText('1/4')
    toolbar.appendSpace()
    this.playBtn = appendIcon('play', this.toggleCycle)
    appendIcon('zoom-in', this.zoomIn)
    appendIcon('zoom-out', this.zoomOut)
    appendIcon('original', this.zoomToOriginal)
    appendIcon('download', this.download)
    appendIcon('fullscreen', this.toggleFullscreen)
    appendIcon('close', () => this.hide())
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body"></div>
      <div class="toolbar"></div>`)
    )
  }
  private toggleFullscreen = () => {
    fullscreen.toggle(this.container)
  }
  private updateCounter = () => {
    const { carousel } = this
    this.counter.setText(
      `${carousel.getActiveIdx() + 1} / ${carousel.getSlides().length}`
    )
  }
  private download = () => {
    const image = this.getActiveImage()
    if (image) {
      image.download()
    }
  }
  private zoomIn = () => {
    const image = this.getActiveImage()
    if (image) {
      image.zoom(0.1)
    }
  }
  private zoomOut = () => {
    const image = this.getActiveImage()
    if (image) {
      image.zoom(-0.1)
    }
  }
  private zoomToOriginal = () => {
    const image = this.getActiveImage()
    if (image) {
      image.zoomTo(1)
    }
  }
  private getActiveImage() {
    const { carousel, images } = this
    const activeIdx = carousel.getActiveIdx()
    const image = images[activeIdx]
    return image
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
    this.carousel.on('slide', () => {
      this.updateCounter()
      const image = this.getActiveImage()
      if (image) {
        image.load()
      }
    })
  }
}

const loadingImg =
  'data:image/gif;base64,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'

class Image {
  container: HTMLElement = h('div')
  private title?: string
  private $container: $.$
  private gallery: Gallery
  private src: string
  private imageViewer: LunaImageViewer
  private loaded = false
  constructor(gallery: Gallery, src: string, title?: string) {
    this.container = h(gallery.c('.image'))
    this.$container = $(this.container)

    this.title = title
    this.gallery = gallery
    this.src = src

    this.initTpl()

    const viewer = this.$container
      .find(gallery.c('.viewer'))
      .get(0) as HTMLElement
    this.imageViewer = new LunaImageViewer(viewer, {
      image: loadingImg,
      initialCoverage: 0.8,
    })
  }
  load() {
    if (this.loaded) {
      return
    }
    this.loaded = true
    loadImg(this.src, (err) => {
      if (!err) {
        this.imageViewer.setOption('image', this.src)
      }
    })
  }
  download() {
    const el = document.createElement('a')
    el.setAttribute('href', this.src)
    el.setAttribute('download', '')
    el.addEventListener('click', function (e) {
      e.stopImmediatePropagation()
    })

    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }
  reset() {
    this.imageViewer.reset()
  }
  zoom(ratio: number) {
    this.imageViewer.zoom(ratio)
  }
  zoomTo(ratio: number) {
    this.imageViewer.zoomTo(ratio)
  }
  private initTpl() {
    const { gallery } = this

    let title = ''
    if (this.title) {
      title = gallery.c(`<div class="title">${this.title}</div>`)
    }

    this.$container.html(
      this.gallery.c(stripIndent`
      <div class="viewer"></div>
      ${title}
    `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Gallery)
}
