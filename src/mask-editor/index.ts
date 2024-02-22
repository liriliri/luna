import Component, { IComponentOptions } from '../share/Component'
import LunaPainter from 'luna-painter'
import debounce from 'licia/debounce'
import Color from 'licia/Color'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Image src. */
  image: string
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
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'mask-editor' }, options)

    this.initTpl()

    const painter = new LunaPainter(
      this.find('.painter').get(0) as HTMLElement,
      {
        tools: [],
      }
    )
    painter.addTool('eraser', new MaskEraser(painter))
    const maskBrush = new MaskBrush(painter)
    painter.addTool('brush', maskBrush)
    painter.useTool('brush')
    this.painter = painter

    const image = new Image()
    image.onload = function () {
      const ctx = painter.getActiveLayer().getContext()
      ctx.drawImage(image, 0, 0, image.width, image.height)
      const idx = painter.addLayer()
      painter.activateLayer(idx)
      const layer = painter.getActiveLayer()
      layer.opacity = 80
      maskBrush.on('optionChange', (name, val) => {
        if (name === 'layerOpacity') {
          layer.opacity = val
          painter.renderCanvas()
        }
      })
      painter.renderCanvas()
    }
    image.src = options.image

    this.addSubComponent(this.painter)

    this.bindEvent()
  }
  /** Get a canvas with mask drawn. */
  getCanvas() {
    return this.canvas
  }
  private initTpl() {
    this.$container.html(this.c('<div class="painter"></painter>'))
  }
  private bindEvent() {
    const { painter } = this

    painter.on(
      'canvasRender',
      debounce(() => {
        this.emit('change')
      }, 20)
    )

    painter.on('foregroundColorChange', (color: string) => {
      const c = new Color(color)
      const rgb = Color.parse(c.toRgb()).val

      const ctx = painter.getActiveLayer().getContext()
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

    toolbar.appendText('Size:')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText('Opacity:')
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

    toolbar.appendText('Size:')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
  }
}
