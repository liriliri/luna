import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import each from 'licia/each'
import ResizeSensor from 'licia/ResizeSensor'
import types from 'licia/types'
import { exportCjs, drag, measuredScrollbarWidth } from '../share/util'
import {
  Brush,
  Pencil,
  Hand,
  Zoom,
  PaintBucket,
  Eraser,
  Eyedropper,
  Tool,
} from './tools'
import { duplicateCanvas } from './util'
import isHidden from 'licia/isHidden'
import I18n from 'licia/I18n'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Canvas width. */
  width?: number
  /** Canvas height. */
  height?: number
  /** Initial tools. */
  tools?: string[]
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
  static i18n = new I18n(navigator.language !== 'zh-CN' ? 'en-US' : 'zh-CN', {
    'en-US': {
      size: 'Size',
      opacity: 'Opacity',
      hardness: 'Hardness',
      sample: 'Sample',
      allLayers: 'All Layers',
      currentLayer: 'Current Layer',
      mode: 'Mode',
      brush: 'Brush',
      pencil: 'Pencil',
      tolerance: 'Tolerance',
      fitScreen: 'Fit Screen',
      fillScreen: 'Fill Screen',
    },
    'zh-CN': {
      size: '大小',
      opacity: '不透明度',
      hardness: '硬度',
      sample: '样本',
      allLayers: '所有图层',
      currentLayer: '当前图层',
      mode: '模式',
      brush: '画笔',
      pencil: '铅笔',
      tolerance: '容差',
      fitScreen: '适合屏幕',
      fillScreen: '填充屏幕',
    },
  })
  static Brush = Brush
  static Eraser = Eraser
  static PaintBucket = PaintBucket
  static Zoom = Zoom
  static Hand = Hand
  private $toolBox: $.$
  private $canvas: $.$
  private $viewport: $.$
  private $body: $.$
  private viewport: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private layers: Layer[] = []
  private currentTool: Tool
  private currentToolName = ''
  private tools: types.PlainObj<Tool> = {}
  private activeLayer: Layer
  private resizeSensor: ResizeSensor
  private $foregroundColor: $.$
  private $backgroundColor: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'painter' }, options)
    this.$container.attr('tabindex', '-1')

    this.initOptions(options, {
      width: 800,
      height: 600,
      tools: ['eyedropper', 'brush', 'pencil', 'eraser', 'paintBucket'],
      tool: 'brush',
    })

    this.initTpl()

    this.$toolBox = this.find('.tool-box')
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

    each(this.options.tools, (tool) => {
      switch (tool) {
        case 'eyedropper':
          this.addTool('eyedropper', new Eyedropper(this))
          break
        case 'brush':
          this.addTool('brush', new Brush(this))
          break
        case 'pencil':
          this.addTool('pencil', new Pencil(this))
          break
        case 'eraser':
          this.addTool('eraser', new Eraser(this))
          break
        case 'paintBucket':
          this.addTool('paintBucket', new PaintBucket(this))
          break
      }
    })
    const hand = new Hand(this)
    this.addTool('hand', hand)
    const zoom = new Zoom(this)
    this.addTool('zoom', zoom)

    this.bindEvent()
    this.resetViewport()
    this.useTool(this.options.tool)

    zoom.fitScreen()
    hand.centerCanvas()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  /** Add layer. */
  addLayer() {
    const layer = new Layer(this)
    this.layers.push(layer)
    return this.layers.length - 1
  }
  /** Get active layer. */
  getActiveLayer() {
    return this.activeLayer
  }
  activateLayer(index: number) {
    this.activeLayer = this.layers[index]
  }
  /** Use tool. */
  useTool(name: string) {
    const tool = this.getTool(name)

    if (tool) {
      if (this.currentTool) {
        this.currentTool.onUnuse()
      }
      this.currentTool = tool
      this.currentToolName = name
      tool.onUse()
    }
  }
  /** Add tool. */
  addTool(name: string, tool: Tool) {
    this.tools[name] = tool
  }
  /** Get current tool name. */
  getCurrentToolName() {
    return this.currentToolName
  }
  /** Get tool. */
  getTool(name: string): Tool {
    return this.tools[name]
  }
  getForegroundColor() {
    return this.$foregroundColor.val()
  }
  setForegroundColor(color: string) {
    this.$foregroundColor.val(color)
    this.emit('foregroundColorChange', color)
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
      ctx.globalAlpha = layer.opacity / 100
      let blendMode = layer.blendMode
      if (blendMode === 'normal') {
        blendMode = 'source-over'
      }
      ctx.globalCompositeOperation = blendMode as any
      const canvas = this.currentTool.onRenderLayer(layer)
      if (canvas) {
        ctx.drawImage(canvas, 0, 0)
      } else {
        ctx.drawImage(layer.getCanvas(), 0, 0)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    })

    this.emit('canvasRender')
  }
  private resizeCanvas(width: number, height: number) {
    const { canvas } = this
    const oldWidth = canvas.width
    const oldHeight = canvas.height

    canvas.width = width
    canvas.height = height

    const x = Math.round((width - oldWidth) / 2)
    const y = Math.round((height - oldHeight) / 2)

    each(this.layers, (layer) => {
      const canvas = layer.getCanvas()
      const tempCanvas = duplicateCanvas(canvas, true)
      canvas.width = width
      canvas.height = height
      layer.getContext().drawImage(tempCanvas, x, y, oldWidth, oldHeight)
    })

    const zoom = this.getTool('zoom') as Zoom
    const ratio = zoom.getRatio()
    zoom.zoomTo(ratio, false)

    this.renderCanvas()
  }
  private initTpl() {
    const { width, height } = this.options

    this.$container.html(
      this.c(stripIndent`
        <div class="toolbar"></div>
        <div class="tool-box">
          <div class="tools"></div>
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
    const { $viewport, $toolBox, $foregroundColor, $backgroundColor, c } = this

    $viewport
      .on(drag('start'), this.onViewportDragStart)
      .on(drag('move'), this.onViewportMouseMove)
      .on('click', this.onViewportClick)
      .on('mouseenter', this.onViewportMouseEnter)
      .on('mouseleave', this.onViewportMouseLeave)

    $toolBox
      .on('click', c('.icon-reset-color'), () => {
        this.setForegroundColor('#000000')
        $backgroundColor.val('#ffffff')
      })
      .on('click', c('.icon-swap'), () => {
        const foreground = $foregroundColor.val()
        this.setForegroundColor($backgroundColor.val())
        $backgroundColor.val(foreground)
      })

    $foregroundColor.on('change', () => {
      this.emit('foregroundColorChange', $foregroundColor.val())
    })

    this.resizeSensor.addListener(this.onResize)

    const zoom = this.getTool('zoom') as Zoom
    zoom.on('change', () => {
      if (this.currentTool) {
        this.currentTool.onZoom()
      }
      this.resetViewport()
    })

    this.on('optionChange', (name, val) => {
      const { canvas } = this
      switch (name) {
        case 'width':
          this.resizeCanvas(val, canvas.height)
          break
        case 'height':
          this.resizeCanvas(canvas.width, val)
          break
      }
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
    if (isHidden(this.container)) {
      return
    }

    this.resetViewport()

    const { $canvas, viewport } = this
    const { width: canvasWidth, height: canvasHeight } = $canvas.offset()
    if (
      canvasWidth < viewport.clientWidth &&
      canvasHeight < viewport.clientHeight
    ) {
      ;(this.getTool('hand') as Hand).centerCanvas
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
  blendMode = 'normal'
  opacity = 100
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  constructor(painter: Painter) {
    const canvas = document.createElement('canvas')
    const { width, height } = painter.getCanvas()
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

export * from './tools'

if (typeof module !== 'undefined') {
  exportCjs(module, Painter)
}
