import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import ResizeSensor from 'licia/ResizeSensor'
import { exportCjs, drag, measuredScrollbarWidth } from '../share/util'
import { Brush, Pencil, Hand, Zoom, PaintBucket, Eraser, Tool } from './tools'

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
  private $viewport: $.$
  private $body: $.$
  private viewport: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private layers: Layer[] = []
  private currentTool: Tool
  private currentToolName = ''
  private brush: Brush
  private pencil: Pencil
  private hand: Hand
  private zoom: Zoom
  private paintBucket: PaintBucket
  private eraser: Eraser
  private activeLayer: Layer
  private resizeSensor: ResizeSensor
  private $foregroundColor: $.$
  private $backgroundColor: $.$
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
    this.$viewport = this.find('.viewport')
    this.viewport = this.$viewport.get(0) as HTMLDivElement
    this.find('.viewport-overlay').css({
      right: measuredScrollbarWidth(),
      bottom: measuredScrollbarWidth(),
    })
    this.$body = this.find('.body')
    this.$foregroundColor = this.find('.palette-foreground').find('input')
    this.$backgroundColor = this.find('.palette-background').find('input')
    this.canvas = this.$canvas.get(0) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!

    this.resizeSensor = new ResizeSensor(container)

    this.addLayer()
    this.activeLayer = this.layers[0]

    this.brush = new Brush(this)
    this.pencil = new Pencil(this)
    this.hand = new Hand(this)
    this.zoom = new Zoom(this)
    this.paintBucket = new PaintBucket(this)
    this.eraser = new Eraser(this)

    this.bindEvent()

    this.resetViewport()
    this.hand.centerCanvas()

    this.useTool(this.options.tool)
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
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
  /** Use tool. */
  useTool(name: string) {
    const { c, $tools } = this

    const tool = this.getTool(name)

    if (tool) {
      if (this.currentTool) {
        this.currentTool.onUnuse()
      }
      this.currentTool = tool
      this.currentToolName = name
      tool.onUse()
      $tools.find(c('.tool')).rmClass(c('selected'))
      $tools.find(`${c('.tool')}[data-tool="${name}"]`).addClass(c('selected'))
    }
  }
  /** Get current tool name. */
  getCurrentToolName() {
    return this.currentToolName
  }
  /** Get tool. */
  getTool(name: string) {
    switch (name) {
      case 'brush':
        return this.brush
      case 'pencil':
        return this.pencil
      case 'hand':
        return this.hand
      case 'zoom':
        return this.zoom
      case 'paintBucket':
        return this.paintBucket
      case 'eraser':
        return this.eraser
    }
  }
  getForegroundColor() {
    return this.$foregroundColor.val()
  }
  getBackgroundColor() {
    return this.$backgroundColor.val()
  }
  getCanvas() {
    return this.canvas
  }
  renderCanvas() {
    const { ctx, canvas, layers } = this

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    each(layers, (layer) => {
      ctx.drawImage(layer.getCanvas(), 0, 0)
      this.currentTool.onAfterRenderLayer(layer)
    })
  }
  private initTpl() {
    const { width, height } = this.options

    this.$container.html(
      this.c(stripIndent`
        <div class="toolbar"></div>
        <div class="tools">
          <div class="tool" data-tool="brush">
            <span class="icon icon-brush"></span>
          </div>
          <div class="tool" data-tool="pencil">
            <span class="icon icon-pencil"></span>
          </div>
          <div class="tool" data-tool="eraser">
            <span class="icon icon-eraser"></span>
          </div>
          <div class="tool" data-tool="paintBucket">
            <span class="icon icon-paint-bucket"></span>
          </div>
          <div class="tool" data-tool="hand">
            <span class="icon icon-hand"></span>
          </div>
          <div class="tool" data-tool="zoom">
            <span class="icon icon-zoom"></span>
          </div>
          <div class="palette">
            <div class="palette-head">
              <span class="icon icon-reset-color"></span>
              <span class="icon icon-swap"></span>
            </div>
            <div class="palette-body">
              <div class="palette-foreground">
                <input type="color" value="#000000"></input>
              </div>
              <div class="palette-background">
                <input type="color" value="#ffffff"></input>
              </div>
            </div>
          </div>
        </div>
        <div class="viewport-wrapper">
          <div class="viewport">
            <div class="body">
              <div class="canvas-wrapper">
                <div class="canvas-container">
                  <canvas class="main-canvas" width="${width}" height="${height}"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="viewport-overlay">
            <div class="cursor"></div>
          </div>
        </div>
      `)
    )
  }
  private bindEvent() {
    const { $viewport, $tools, $foregroundColor, $backgroundColor, c } = this

    $viewport
      .on(drag('start'), this.onViewportDragStart)
      .on('click', this.onViewportClick)
      .on('mouseenter', this.onViewportMouseEnter)
      .on('mousemove', this.onViewportMouseMove)
      .on('mouseleave', this.onViewportMouseLeave)

    const self = this
    $tools
      .on('click', c('.tool'), function (this: HTMLDivElement) {
        const $this = $(this)
        self.useTool($this.data('tool'))
      })
      .on('click', c('.icon-reset-color'), () => {
        $foregroundColor.val('#000000')
        $backgroundColor.val('#ffffff')
      })
      .on('click', c('.icon-swap'), () => {
        const foreground = $foregroundColor.val()
        $foregroundColor.val($backgroundColor.val())
        $backgroundColor.val(foreground)
      })

    this.resizeSensor.addListener(this.onResize)

    this.zoom.on('change', (ratio) => {
      this.currentTool.onZoom(ratio)
      this.resetViewport()
    })
  }
  private onViewportMouseEnter = (e: any) => {
    this.currentTool.onMouseEnter(e.origEvent)
  }
  private onViewportMouseMove = (e: any) => {
    this.currentTool.onMouseMove(e.origEvent)
  }
  private onViewportMouseLeave = (e: any) => {
    this.currentTool.onMouseLeave(e.origEvent)
  }
  private onViewportDragStart = (e: any) => {
    this.currentTool.onDragStart(e.origEvent)
    $document.on(drag('move'), this.onViewportDragMove)
    $document.on(drag('end'), this.onViewportDragEnd)
  }
  private onViewportDragMove = (e: any) => {
    this.currentTool.onDragMove(e.origEvent)
  }
  private onViewportDragEnd = (e: any) => {
    this.currentTool.onDragEnd(e.origEvent)
    $document.off(drag('move'), this.onViewportDragMove)
    $document.off(drag('end'), this.onViewportDragEnd)
  }
  private onViewportClick = (e: any) => {
    this.currentTool.onClick(e.origEvent)
  }
  private onResize = () => {
    this.resetViewport()

    const { $canvas, viewport } = this
    const { width: canvasWidth, height: canvasHeight } = $canvas.offset()
    if (
      canvasWidth < viewport.clientWidth &&
      canvasHeight < viewport.clientHeight
    ) {
      this.hand.centerCanvas()
    }
  }
  private resetViewport = () => {
    const { $body, $canvas, viewport } = this
    const { width: canvasWidth, height: canvasHeight } = $canvas.offset()
    const width =
      (viewport.clientWidth - Math.min(canvasWidth, 100)) * 2 + canvasWidth
    const height =
      (viewport.clientHeight - Math.min(canvasHeight, 100)) * 2 + canvasHeight
    $body.css({
      width,
      height,
    })
  }
}

export class Layer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  constructor(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
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
