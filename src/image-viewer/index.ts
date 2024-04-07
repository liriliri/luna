import Component, { IComponentOptions } from '../share/Component'
import { exportCjs, drag, eventPage } from '../share/util'
import ResizeSensor from 'licia/ResizeSensor'
import $ from 'licia/$'
import raf from 'licia/raf'
import loadImg from 'licia/loadImg'
import isHidden from 'licia/isHidden'
import debounce from 'licia/debounce'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Image src. */
  image: string
  /** Initial coverage. */
  initialCoverage?: number
}

interface IImageData {
  left: number
  top: number
  width: number
  height: number
  rotate: number
  naturalWidth: number
  naturalHeight: number
  ratio: number
}

/** Pivot point coordinate for zooming. */
export interface IPivot {
  /** Pivot point x. */
  x: number
  /** Pivot point y. */
  y: number
}

/**
 * Single image viewer.
 *
 * @example
 * const imageViewer = new LunaImageViewer(container, {
 *   image: 'https://res.liriliri.io/luna/pic1.jpg',
 * })
 * imageViewer.zoom(0.1)
 */
export default class ImageViewer extends Component<IOptions> {
  private imageData: IImageData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    rotate: 0,
    naturalWidth: 0,
    naturalHeight: 0,
    ratio: 1,
  }
  private resizeSensor: ResizeSensor
  private $image: $.$
  private image: HTMLImageElement
  private $ratio: $.$
  private startX = 0
  private startY = 0
  private isWheeling = false
  private ratioHideTimer: any = 0
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'image-viewer' })
    this.initOptions(options, {
      initialCoverage: 0.9,
    })

    this.resizeSensor = new ResizeSensor(container)

    this.initTpl()
    this.$image = this.find('.image')
    this.image = this.$image.get(0) as HTMLImageElement
    this.$ratio = this.find('.ratio')

    this.bindEvent()

    this.setImage(this.options.image)
  }
  /** Rotate image with a relative degree. */
  rotate(degree: number) {
    this.rotateTo(this.imageData.rotate + degree)

    this.render()
  }
  /** Rotate image to an absolute degree. */
  rotateTo(degree: number) {
    this.imageData.rotate = degree
  }
  /** Zoom image with a relative ratio. */
  zoom(ratio: number, pivot?: IPivot) {
    const { imageData } = this

    ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio

    this.zoomTo((imageData.width * ratio) / imageData.naturalWidth, pivot)
  }
  /** Zoom image to an absolute ratio. */
  zoomTo(ratio: number, pivot?: IPivot) {
    const { imageData } = this
    const { naturalWidth, naturalHeight, width, height } = imageData

    const newWidth = naturalWidth * ratio
    const newHeight = naturalHeight * ratio
    const offsetWidth = newWidth - width
    const offsetHeight = newHeight - height

    imageData.width = newWidth
    imageData.height = newHeight
    imageData.ratio = ratio

    if (!pivot) {
      pivot = {
        x: width / 2 + imageData.left,
        y: height / 2 + imageData.top,
      }
    }

    imageData.left -= offsetWidth * ((pivot.x - imageData.left) / width)
    imageData.top -= offsetHeight * ((pivot.y - imageData.top) / height)

    this.render()

    this.showRatio()
  }
  /** Reset image to initial state. */
  reset = () => {
    if (isHidden(this.container)) {
      return
    }

    const { image, $container, $image, c } = this
    const { initialCoverage } = this.options
    const { width: viewerWidth, height: viewerHeight } = $container.offset()
    const naturalWidth = image.naturalWidth || image.width
    const naturalHeight = image.naturalHeight || image.height
    const aspectRatio = naturalWidth / naturalHeight

    let width = viewerWidth
    let height = viewerHeight
    if (viewerHeight * aspectRatio > viewerWidth) {
      height = viewerWidth / aspectRatio
    } else {
      width = viewerHeight * aspectRatio
    }
    width = Math.min(width * initialCoverage, naturalWidth)
    height = Math.min(height * initialCoverage, naturalHeight)

    const left = (viewerWidth - width) / 2
    const top = (viewerHeight - height) / 2

    this.imageData = {
      left,
      top,
      width,
      height,
      rotate: 0,
      naturalWidth,
      naturalHeight,
      ratio: width / naturalWidth,
    }

    $image.rmClass(c('image-transition'))
    this.render()
    raf(() => setTimeout(() => $image.addClass(c('image-transition')), 0))
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  private showRatio() {
    const { $ratio } = this

    $ratio.text(`${Math.round(this.imageData.ratio * 100)}%`)

    const showClass = this.c('show')
    if (!this.ratioHideTimer) {
      $ratio.addClass(showClass)
    } else {
      clearTimeout(this.ratioHideTimer)
    }

    this.ratioHideTimer = setTimeout(() => {
      $ratio.rmClass(showClass)
      this.ratioHideTimer = null
    }, 1000)
  }
  private onMoveStart = (e: any) => {
    e.preventDefault()
    e = e.origEvent
    this.startX = eventPage('x', e)
    this.startY = eventPage('y', e)
    this.$image.rmClass(this.c('image-transition'))
    this.$container.on(drag('move'), this.onMove)
    $document.on(drag('end'), this.onMoveEnd)
  }
  private onMove = (e: any) => {
    const { imageData } = this
    e = e.origEvent
    const deltaX = eventPage('x', e) - this.startX
    const deltaY = eventPage('y', e) - this.startY
    const newLeft = imageData.left + deltaX
    const newTop = imageData.top + deltaY
    this.$image.css({
      marginLeft: newLeft,
      marginTop: newTop,
    })
  }
  private onMoveEnd = (e: any) => {
    const { imageData } = this

    e = e.origEvent
    const deltaX = eventPage('x', e) - this.startX
    const deltaY = eventPage('y', e) - this.startY
    imageData.left += deltaX
    imageData.top += deltaY
    this.render()

    this.$image.addClass(this.c('image-transition'))
    this.$container.off(drag('move'), this.onMove)
    $document.off(drag('end'), this.onMoveEnd)
  }
  private setImage(image: string) {
    loadImg(image, (err) => {
      if (image !== this.options.image) {
        return
      }
      if (err) {
        this.emit('error', err)
      } else {
        this.$image.attr('src', image)
      }
    })
  }
  private bindEvent() {
    this.image.onload = () => this.reset()

    this.resizeSensor.addListener(debounce(this.reset, 20))

    this.$container
      .on(drag('start'), this.onMoveStart)
      .on('wheel', this.onWheel)

    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'image':
          this.setImage(val)
          break
      }
    })
  }
  private onWheel = (e: any) => {
    e.preventDefault()

    if (this.isWheeling) {
      return
    }

    this.isWheeling = true
    setTimeout(() => (this.isWheeling = false), 50)

    e = e.origEvent
    const delta = e.deltaY > 0 ? 1 : -1

    const offset = this.$container.offset()
    this.zoom(-delta * 0.1, {
      x: e.pageX - offset.left,
      y: e.pageY - offset.top,
    })
  }
  private render() {
    const { imageData } = this

    this.$image.css({
      width: imageData.width,
      height: imageData.height,
      marginLeft: imageData.left,
      marginTop: imageData.top,
      transform: `rotate(${imageData.rotate}deg)`,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(`
        <img class="image"></img>
        <div class="ratio"></div>
      `)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ImageViewer)
}
