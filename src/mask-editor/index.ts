import Component, { IComponentOptions } from '../share/Component'
import LunaPainter, { Layer, Zoom, Hand } from 'luna-painter'
import debounce from 'licia/debounce'
import Color from 'licia/Color'
import { exportCjs, loadImage } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Image src. */
  image: string
  /** Mask src. */
  mask?: string
}

/**
 * Image mask editing.
 *
 * @example
 * const container = document.getElementById('container')
 * const maskEditor = new LunaMaskEditor(container)
 */
export default class MaskEditor extends Component<IOptions> {
  private painter: LunaPainter
  private canvas: HTMLCanvasElement
  private blackCanvas: HTMLCanvasElement
  private blackCtx: CanvasRenderingContext2D
  private ctx: CanvasRenderingContext2D
  private maskBrush: MaskBrush
  private baseLayer: Layer
  private drawingLayer: Layer
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'mask-editor' }, options)
    this.initOptions(options)

    this.initTpl()

    const painter = new LunaPainter(
      this.find('.painter').get(0) as HTMLElement,
      {
        tools: [],
      }
    )
    painter.addTool('paintBucket', new MaskPaintBucket(painter))
    painter.addTool('eraser', new MaskEraser(painter))
    this.maskBrush = new MaskBrush(painter)
    painter.addTool('brush', this.maskBrush)
    painter.useTool('brush')
    this.painter = painter
    this.addSubComponent(this.painter)

    this.baseLayer = painter.getActiveLayer()
    const idx = painter.addLayer()
    painter.activateLayer(idx)
    this.drawingLayer = painter.getActiveLayer()
    this.drawingLayer.opacity = 80
    painter.renderCanvas()

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.blackCanvas = document.createElement('canvas')
    this.blackCtx = this.blackCanvas.getContext('2d')!

    this.bindEvent()

    this.loadImage().then(() => this.loadMask())
  }
  /** Get a canvas with mask drawn. */
  getCanvas() {
    return this.canvas
  }
  private async loadImage() {
    const { painter } = this
    if (!this.options.image) {
      return
    }

    const image = await loadImage(this.options.image)

    const { width, height } = image
    painter.setOption({
      width,
      height,
    })

    const ctx = this.baseLayer.getContext()
    ctx.drawImage(image, 0, 0, width, height)
    painter.renderCanvas()

    this.renderMask()

    const zoom = painter.getTool('zoom') as Zoom
    zoom.fitScreen()
    const hand = painter.getTool('hand') as Hand
    hand.centerCanvas()
  }
  private async loadMask() {
    const { painter } = this
    if (!this.options.mask) {
      return
    }

    const image = await loadImage(this.options.mask)

    const width = painter.getOption('width')
    const height = painter.getOption('height')
    const ctx = this.drawingLayer.getContext()
    ctx.drawImage(image, 0, 0, width, height)
    const c = new Color(painter.getForegroundColor())
    const rgb = Color.parse(c.toRgb()).val
    const canvas = ctx.canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { data } = imageData
    for (let i = 0, len = data.length; i < len; i += 4) {
      data[i + 3] = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = rgb[0]
      data[i + 1] = rgb[1]
      data[i + 2] = rgb[2]
    }
    ctx.putImageData(imageData, 0, 0)
    painter.renderCanvas()

    this.renderMask()
  }
  private renderMask() {
    const { canvas, ctx, blackCanvas, blackCtx, painter } = this
    const { width, height } = painter.getCanvas()

    blackCanvas.width = width
    blackCanvas.height = height
    blackCtx.fillStyle = '#000000'
    blackCtx.fillRect(0, 0, width, height)
    blackCtx.globalCompositeOperation = 'destination-out'
    blackCtx.drawImage(painter.getActiveLayer().getCanvas(), 0, 0)

    canvas.width = width
    canvas.height = height
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(blackCanvas, 0, 0)
  }
  private initTpl() {
    this.$container.html(this.c('<div class="painter"></painter>'))
  }
  private bindEvent() {
    const { painter, maskBrush } = this

    painter.on(
      'renderCanvas',
      debounce(() => {
        this.renderMask()
        this.emit('change', this.canvas)
      }, 20)
    )

    painter.on('changeForegroundColor', (color: string) => {
      const c = new Color(color)
      const rgb = Color.parse(c.toRgb()).val

      const ctx = this.drawingLayer.getContext()
      const canvas = ctx.canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData
      for (let i = 0, len = data.length; i < len; i += 4) {
        data[i] = rgb[0]
        data[i + 1] = rgb[1]
        data[i + 2] = rgb[2]
      }
      ctx.putImageData(imageData, 0, 0)
      painter.renderCanvas()
    })

    maskBrush.on('changeOption', (name, val) => {
      if (name === 'layerOpacity') {
        this.drawingLayer.opacity = val
        painter.renderCanvas()
      }
    })

    this.on('changeOption', (name) => {
      switch (name) {
        case 'image':
          this.loadImage()
          break
        case 'mask':
          this.loadMask()
          break
      }
    })
  }
}

class MaskBrush extends LunaPainter.Brush {
  constructor(painter: LunaPainter) {
    super(painter)

    this.$tool.remove()
    painter.$container
      .find(painter.c('.tools'))
      .prepend(this.$tool.get(0) as HTMLElement)

    this.options.layerOpacity = 80
  }
  protected renderToolbar() {
    const { toolbar, options } = this
    toolbar.clear()

    toolbar.appendText(LunaPainter.i18n.t('size') + ':')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText(LunaPainter.i18n.t('opacity') + ':')
    toolbar.appendNumber('layerOpacity', options.layerOpacity, {
      min: 1,
      max: 100,
      step: 1,
    })
  }
}

class MaskEraser extends LunaPainter.Eraser {
  constructor(painter: LunaPainter) {
    super(painter)

    this.$tool.remove()
    painter.$container
      .find(painter.c('.tools'))
      .prepend(this.$tool.get(0) as HTMLElement)
  }
  protected renderToolbar() {
    const { toolbar, options } = this
    toolbar.clear()

    toolbar.appendText(LunaPainter.i18n.t('size') + ':')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
  }
}

class MaskPaintBucket extends LunaPainter.PaintBucket {
  constructor(painter: LunaPainter) {
    super(painter)
    this.options.tolerance = 100
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, MaskEditor)
}
