import Tool from './Tool'
import Brush from './Brush'
import Pencil from './Pencil'
import Painter, { Layer } from '../'
import nextTick from 'licia/nextTick'
import { CursorCircle } from './Pencil'

export default class Eraser extends Tool {
  private cursorCircle: CursorCircle
  constructor(painter: Painter) {
    super(painter, 'eraser')

    this.options = {
      mode: 'brush',
      size: 4,
      opacity: 100,
      hardness: 100,
    }

    this.cursorCircle = new CursorCircle(
      this.cursor,
      painter,
      this.options.size
    )

    this.bindEvent()
  }
  onUse() {
    super.onUse()
    this.cursorCircle.render()
  }
  onDragStart(e: any) {
    nextTick(() => {
      this.getTool().onDragStart(e, this.getOptions())
    })
  }
  onDragMove(e: any) {
    this.getTool().onDragMove(e)
  }
  onDragEnd(e: any) {
    this.getTool().onDragEnd(e)
  }
  onRenderLayer(layer: Layer) {
    return this.getTool().onRenderLayer(layer)
  }
  onZoom() {
    super.onZoom()
    this.cursorCircle.render()
  }
  private getTool(): Brush | Pencil {
    return this.painter.getTool(this.options.mode) as any
  }
  private getOptions() {
    const { options } = this

    return {
      color: 'transparent',
      size: options.size,
      opacity: options.opacity,
      hardness: options.hardness,
    }
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, options } = this

    toolbar.appendText('Mode:')
    toolbar.appendSelect('mode', options.mode, {
      Brush: 'brush',
      Pencil: 'pencil',
    })
    toolbar.appendText('Size:')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText('Hardness:')
    toolbar.appendNumber('hardness', options.hardness, {
      min: 1,
      max: 100,
      step: 1,
    })
    toolbar.appendText('Opacity:')
    toolbar.appendNumber('opacity', options.opacity, {
      min: 1,
      max: 100,
      step: 1,
    })
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      if (name === 'size') {
        this.cursorCircle.setSize(val)
      }
    })
  }
}
