import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import types from 'licia/types'
import { exportCjs, drag } from '../share/util'
import { Brush, Pencil, Tool } from './tools'

const $document = $(document as any)

/** IOptions. */
export interface IOptions extends IComponentOptions {
  /** Canvas width. */
  width?: number
  /** Canvas height. */
  height?: number
  /** Initial used tool. */
  tool?: string
}

/**
 * Simple drawing tool.
 *
 * @example
 * const container = document.getElementById('container')
 * const painer = new LunaPainter(container)
 */
export default class Painter extends Component<IOptions> {
  private $tools: $.$
  private $canvas: $.$
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private layers: Layer[] = []
  private currentTool: Tool
  private tools: types.PlainObj<Tool> = {
    brush: new Brush(this),
    pencil: new Pencil(this),
  }
  private activeLayer: Layer
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'painter' }, options)

    this.initOptions(options, {
      width: 800,
      height: 600,
      tool: 'brush',
    })

    this.initTpl()

    this.$tools = this.find('.tools')
    this.$canvas = this.find('.main-canvas')
    this.canvas = this.$canvas.get(0) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.addLayer()
    this.activeLayer = this.layers[0]

    this.bindEvent()

    this.use(this.options.tool)
  }
  /** Add layer. */
  addLayer() {
    const { width, height } = this.options
    const layer = new Layer(width, height)
    this.layers.push(layer)
  }
  /** Get active layer. */
  getActiveLayer() {
    return this.activeLayer
  }
  /** Set tool. */
  use(name: string) {
    const { c, $tools } = this

    if (this.tools[name]) {
      this.currentTool = this.tools[name]
      $tools.find(c('.tool')).rmClass(c('selected'))
      $tools.find(`${c('.tool')}[data-tool="${name}"]`).addClass(c('selected'))
    }
  }
  getCanvas() {
    return this.canvas
  }
  updateCanvas() {
    const { ctx, canvas, layers } = this

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    each(layers, (layer) => {
      ctx.drawImage(layer.getCanvas(), 0, 0)
    })
  }
  private initTpl() {
    const { width, height } = this.options

    this.$container.html(
      this.c(stripIndent`
        <div class="tools">
          <div class="tool" data-tool="brush">
            <span class="icon icon-brush"></span>
          </div>
          <div class="tool" data-tool="pencil">
            <span class="icon icon-pencil"></span>
          </div>
        </div>
        <div class="viewport">
          <div class="canvas-wrapper">
            <div class="canvas-container">
              <canvas class="main-canvas" width="${width}" height="${height}"></canvas>
            </div>
          </div>
        </div>
      `)
    )
  }
  private bindEvent() {
    const { $canvas, $tools, c } = this

    $canvas.on(drag('start'), this.onCanvasDragStart)

    const self = this
    $tools.on('click', c('.tool'), function (this: HTMLDivElement) {
      const $this = $(this)
      self.use($this.data('tool'))
    })
  }
  private onCanvasDragStart = (e: any) => {
    this.currentTool.onDragStart(e.origEvent)
    $document.on(drag('move'), this.onCanvasDragMove)
    $document.on(drag('end'), this.onCanvasDragEnd)
  }
  private onCanvasDragMove = (e: any) => {
    this.currentTool.onDragMove(e.origEvent)
  }
  private onCanvasDragEnd = (e: any) => {
    this.currentTool.onDragEnd(e.origEvent)
    $document.off(drag('move'), this.onCanvasDragMove)
    $document.off(drag('end'), this.onCanvasDragEnd)
  }
}

class Layer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  constructor(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.canvas = canvas

    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  }
  getContext() {
    return this.ctx
  }
  getCanvas() {
    return this.canvas
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Painter)
}
