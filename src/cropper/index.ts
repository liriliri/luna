import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import extend from 'licia/extend'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'

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
  private $canvas: $.$
  private $cropBox: $.$
  constructor(container: HTMLElement, { url }: IOptions) {
    super(container, { compName: 'cropper' })

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
        <div class="drag-box"></div>
        <div class="crop-box" style="width: 554.8px; height: 312.075px; transform: translateX(29.1px) translateY(56.775px);">
          <span class="view-box">
            <img></img>
          </span>
          <span class="dashed dashed-h"></span>
          <span class="dashed dashed-v"></span>
          <span class="center"></span>
          <span class="line line-e"></span>
          <span class="line line-n"></span>
          <span class="line line-w"></span>
          <span class="line line-s"></span>
          <span class="point point-e"></span>
          <span class="point point-n"></span>
          <span class="point point-w"></span>
          <span class="point point-s"></span>
          <span class="point point-ne"></span>
          <span class="point point-nw"></span>
          <span class="point point-sw"></span>
          <span class="point point-se"></span>
        </div>
      `)
    )
  }
}

const round = Math.round
