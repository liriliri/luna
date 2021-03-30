import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import extend from 'licia/extend'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import clone from 'licia/clone'

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
  ratio: number
}

export = class Cropper extends Component {
  private onResize: () => void
  private options: Required<IOptions>
  private resizeSensor: ResizeSensor
  private containerData: IContainerData = {
    width: 0,
    height: 0,
    ratio: 0,
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
  private $canvas: $.$
  constructor(container: HTMLElement, { url }: IOptions) {
    super(container, { compName: 'cropper' })

    this.options = {
      url,
    }
    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this._onResize(), 16)

    this.updateContainerData()
    this.initTpl()
    this.$canvas = this.find('.canvas')

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
  private load(url: string) {
    const { image } = this.imageData
    this.$canvas.find('img').attr('src', url)

    image.onload = () => {
      extend(this.imageData, {
        width: image.width,
        height: image.height,
        ratio: image.width / image.height,
      })
      this.initCanvasData()
      this.updateCanvas()
    }
    image.src = url
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
  }
  private _onResize = () => {
    const { containerData, canvasData, imageData } = this
    const oldContainerData = clone(containerData)
    this.updateContainerData()

    if (containerData.width !== oldContainerData.width) {
      const ratio = containerData.width / oldContainerData.width
      canvasData.left *= ratio
      canvasData.width *= ratio
      canvasData.height = canvasData.width / imageData.ratio
    }

    if (containerData.height !== oldContainerData.height) {
      const ratio = containerData.height / oldContainerData.height
      canvasData.top *= ratio
    }

    this.updateCanvas()
  }
  private initCanvasData() {
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
      ratio: width / height,
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
        <div class="crop-box"></div>
      `)
    )
  }
}

const round = Math.round
