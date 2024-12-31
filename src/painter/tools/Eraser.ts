import Tool from './Tool'
import Brush from './Brush'
import Pencil from './Pencil'
import Painter, { Layer } from '../'
import nextTick from 'licia/nextTick'
import { CursorCircle } from './Pencil'
import hotkey from 'licia/hotkey'

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

    toolbar.appendText(Painter.i18n.t('mode') + ':')
    toolbar.appendSelect('mode', options.mode, {
      [Painter.i18n.t('brush')]: 'brush',
      [Painter.i18n.t('pencil')]: 'pencil',
    })
    toolbar.appendText(Painter.i18n.t('size') + ':')
    toolbar.appendNumber('size', options.size, {
      min: 1,
      max: 1000,
      step: 1,
    })
    toolbar.appendText(Painter.i18n.t('hardness') + ':')
    toolbar.appendNumber('hardness', options.hardness, {
      min: 1,
      max: 100,
      step: 1,
    })
    toolbar.appendText(Painter.i18n.t('opacity') + ':')
    toolbar.appendNumber('opacity', options.opacity, {
      min: 1,
      max: 100,
      step: 1,
    })
  }
  private bindEvent() {
    const { cursorCircle, painter } = this

    this.on('changeOption', (name, val) => {
      if (name === 'size') {
        cursorCircle.setSize(val)
      }
    })
    const options = {
      element: painter.container,
    }
    hotkey.on('[', options, () => {
      if (this.isUsing) {
        this.setOption('size', cursorCircle.decrease())
      }
    })
    hotkey.on(']', options, () => {
      if (this.isUsing) {
        this.setOption('size', cursorCircle.increase())
      }
    })
    hotkey.on('e', options, () => {
      if (!this.isUsing) {
        painter.useTool('eraser')
      }
    })
  }
}
