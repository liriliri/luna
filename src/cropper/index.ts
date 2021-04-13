import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import extend from 'licia/extend'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import clone from 'licia/clone'
import max from 'licia/max'
import { drag, eventClient } from '../share/util'

const $document = $(document as any)

interface IOptions {
  url: string
}

interface IImageData {
  image: HTMLImageElement
  width: number
  height: number
  ratio: number
}

interface ICanvasData {
  left: number
  top: number
  width: number
  height: number
}

interface IContainerData {
  width: number
  height: number
}

interface ICropBoxData {
  left: number
  top: number
  width: number
  height: number
}

export = class Cropper extends Component {
  private onResize: () => void
  private options: Required<IOptions>
  private resizeSensor: ResizeSensor
  private containerData: IContainerData = {
    width: 0,
    height: 0,
  }
  private imageData: IImageData = {
    image: new Image(),
    width: 0,
    height: 0,
    ratio: 0,
  }
  private canvasData: ICanvasData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  }
  private cropBoxData: ICropBoxData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  }
  private oldCropBoxData: ICropBoxData
  private $canvas: $.$
  private $cropBox: $.$
  private action: string = ''
  private startX: number = 0
  private startY: number = 0
  constructor(container: HTMLElement, { url }: IOptions) {
    super(container, { compName: 'cropper' })

    this.oldCropBoxData = this.cropBoxData

    this.options = {
      url,
    }
    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this.reset(), 16)

    this.updateContainerData()
    this.initTpl()
    this.$canvas = this.find('.canvas')
    this.$cropBox = this.find('.crop-box')

    this.bindEvent()

    this.load(url)
  }
  setOption(name: string, val: any) {
    const options: any = this.options
    const oldVal = options[name]
    options[name] = val
    this.emit('optionChange', val, oldVal)

    switch (name) {
      case 'url':
        this.load(val)
        break
    }
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  reset() {
    this.updateContainerData()
    this.resetCanvasData()
    this.updateCanvas()
    this.resetCropBoxData()
    this.updateCropBox()
  }
  private load(url: string) {
    const { image } = this.imageData
    this.$canvas.find('img').attr('src', url)
    this.$cropBox.find('img').attr('src', url)

    image.onload = () => {
      extend(this.imageData, {
        width: image.width,
        height: image.height,
        ratio: image.width / image.height,
      })
      this.reset()
    }
    image.src = url
  }

  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
    this.$container.on(drag('start'), this.onCropStart)
  }
  private onCropStart = (e: any) => {
    e = e.origEvent
    this.action = $(e.target).data('action')
    this.startX = eventClient('x', e)
    this.startY = eventClient('y', e)
    this.oldCropBoxData = clone(this.cropBoxData)
    $document.on(drag('move'), this.onCropMove)
    $document.on(drag('end'), this.onCropEnd)
  }
  private onCropMove = (e: any) => {
    e = e.origEvent
    const { action, canvasData, oldCropBoxData } = this
    let { left, top, width, height } = oldCropBoxData
    const deltaX = eventClient('x', e) - this.startX
    const deltaY = eventClient('y', e) - this.startY
    const minSize = 10
    const minLeft = canvasData.left
    const minTop = canvasData.top
    const maxLeft = canvasData.left + canvasData.width
    const maxTop = canvasData.top + canvasData.height
    let fixedLeft = false
    let fixedTop = false
    let fixedWidth = false
    let fixedHeight = false

    switch (action) {
      case 'all':
        left += deltaX
        top += deltaY
        fixedWidth = true
        fixedHeight = true
        break
      case 'e':
        width += deltaX
        width = max(minSize, width)
        fixedLeft = true
        break
      case 'w':
        left += deltaX
        width -= deltaX
        break
      case 's':
        height += deltaY
        height = max(minSize, height)
        fixedTop = true
        break
    }

    left = max(minLeft, left)
    top = max(minTop, top)
    if (left + width > maxLeft) {
      if (fixedWidth) {
        left = maxLeft - width
      } else {
        width = maxLeft - left
      }
    }
    if (top + height > maxTop) {
      if (fixedHeight) {
        top = maxTop - height
      } else {
        height = maxTop - top
      }
    }

    extend(this.cropBoxData, {
      left,
      top,
      width,
      height,
    })

    this.updateCropBox()
  }
  private onCropEnd = () => {
    console.log('crop end')
    $document.off(drag('move'), this.onCropMove)
    $document.off(drag('end'), this.onCropEnd)
  }
  private resetCropBoxData() {
    const { canvasData } = this

    const left = canvasData.width / 8 + canvasData.left
    const top = canvasData.height / 8 + canvasData.top

    extend(this.cropBoxData, {
      left,
      top,
      width: canvasData.width - canvasData.width / 4,
      height: canvasData.height - canvasData.height / 4,
    })
  }
  private updateCropBox() {
    const { cropBoxData, canvasData } = this
    const { left, top, width, height } = cropBoxData
    this.$cropBox.css({
      width: round(width),
      height: round(height),
      transform: `translateX(${round(left)}px) translateY(${round(top)}px)`,
    })
    this.$cropBox.find('img').css({
      width: round(canvasData.width),
      height: round(canvasData.height),
      transform: `translateX(${-round(left)}px) translateY(${-round(
        top - canvasData.top
      )}px)`,
    })
  }
  private resetCanvasData() {
    const { imageData, containerData } = this

    let width = imageData.width
    let height = imageData.height

    if (width > containerData.width) {
      width = containerData.width
      height = width / imageData.ratio
    }
    if (height > containerData.height) {
      height = containerData.height
      width = height * imageData.ratio
    }

    extend(this.canvasData, {
      left: (containerData.width - width) / 2,
      top: (containerData.height - height) / 2,
      width,
      height,
    })
  }
  private updateCanvas() {
    const { left, top, width, height } = this.canvasData
    this.$canvas.css({
      width: round(width),
      height: round(height),
      transform: `translateX(${round(left)}px) translateY(${round(top)}px)`,
    })
  }
  private updateContainerData() {
    const { width, height } = this.$container.offset()
    extend(this.containerData, {
      width,
      height,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="wrap-box">
          <div class="canvas">
            <img></img>
          </div>
        </div>
        <div class="drag-box" data-action="crop"></div>
        <div class="crop-box" style="width: 554.8px; height: 312.075px; transform: translateX(29.1px) translateY(56.775px);">
          <span class="view-box">
            <img draggable="false"></img>
          </span>
          <span class="dashed dashed-h"></span>
          <span class="dashed dashed-v"></span>
          <span class="center"></span>
          <span class="face" data-action="all"></span>
          <span class="line line-e" data-action="e"></span>
          <span class="line line-n" data-action="n"></span>
          <span class="line line-w" data-action="w"></span>
          <span class="line line-s" data-action="s"></span>
          <span class="point point-e" data-action="e"></span>
          <span class="point point-n" data-action="n"></span>
          <span class="point point-w" data-action="w"></span>
          <span class="point point-s" data-action="s"></span>
          <span class="point point-ne" data-action="ne"></span>
          <span class="point point-nw" data-action="nw"></span>
          <span class="point point-sw" data-action="sw"></span>
          <span class="point point-se" data-action="se"></span>
        </div>
      `)
    )
  }
}

const round = Math.round
