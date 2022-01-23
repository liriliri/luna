import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'

interface IOptions {
  title: string
}

export default class PerformanceMonitor extends Component<IOptions> {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  constructor(container: HTMLElement, { title }: IOptions) {
    super(container, { compName: 'performance-monitor' })

    this.options = {
      title,
    }

    this.initTpl()

    const canvas = document.createElement('canvas')
    this.$container.append(canvas)
    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    this.start()
  }
  start() {
    this.draw()
  }
  stop() {}
  private draw() {}
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="title"></div>
      `)
    )
  }
}

module.exports = PerformanceMonitor
module.exports.default = PerformanceMonitor
