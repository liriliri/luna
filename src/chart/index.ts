import Component, { IComponentOptions } from '../share/Component'
import BaseChart from './BaseChart'
import BarChart from './BarChart'
import LineChart from './LineChart'
import PieChart from './PieChart'
import RingChart from './RingChart'
import defaults from 'licia/defaults'
import { DeepRequired } from '../share/types'
import { px } from './util'

interface ITitle {
  text: string
  font?: string
  color?: string
  position?: 'top' | 'bottom'
  top?: number
  bottom?: number
}

interface IPadding {
  left?: number
  right?: number
  top?: number
  bottom?: number
}

interface IData {
  labels: string[]
  datasets: any[]
}

interface Options extends IComponentOptions {
  type?: string
  bgColor?: string
  title?: ITitle
  padding?: IPadding
  data: IData
}

type IOptions = DeepRequired<
  Options,
  | ['title', 'font']
  | ['title', 'color']
  | ['title', 'top']
  | ['title', 'bottom']
>

/**
 * HTML5 charts.
 *
 * @example
 * const container = document.getElementById('container')
 * const barChart = new LunaChart(container, {
 *   type: 'bar',
 *   bgColor: '#fbfbfb',
 *   title: {
 *       text: 'Bar Chart',
 *   },
 *   data: {
 *     labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
 *     datasets: [
 *       {
 *         label: 'Dataset 1',
 *         bgColor: '#e73c5e',
 *         data: [128, 146, 56, 84, 222],
 *       },
 *       {
 *         label: '#614d82',
 *         bgColor: '#614d82',
 *         data: [119, 23, 98, 67, 88],
 *       },
 *     ],
 *   },
 * })
 */
export default class Chart extends Component<IOptions> {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  private chart: BaseChart
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'chart' }, options)

    this.initOptions(options, {
      type: 'bar',
      bgColor: '#fff',
      title: { text: '' },
      padding: {},
    })
    const title = this.options.title
    defaults(title, {
      font: `bold ${px(18)}px Arial`,
      color: '#666',
      position: 'top',
      top: px(10),
      bottom: px(5),
    })
    const padding = this.options.padding
    defaults(padding, {
      left: px(50),
      right: px(10),
      top: px(60),
      bottom: px(50),
    })

    this.initCanvas()
    this.initChart()
    this.draw()
  }
  getOption(name: string) {
    return (this.options as any)[name]
  }
  draw() {
    this.drawBg()
    this.drawTitle()
    this.chart.draw()
  }
  private drawTitle() {
    const { ctx } = this
    const { title } = this.options
    const { width, height } = this.canvas
    if (!title.text) {
      return
    }

    ctx.beginPath()
    ctx.font = title.font
    ctx.fillStyle = title.color
    ctx.textAlign = 'center'
    if (title.position === 'top') {
      ctx.textBaseline = 'top'
      ctx.fillText(title.text, width / 2, title.top)
    } else {
      ctx.textBaseline = 'bottom'
      ctx.fillText(title.text, width / 2, height - title.bottom)
    }
  }
  private drawBg() {
    const { ctx } = this
    const { width, height } = this.canvas

    ctx.fillStyle = this.options.bgColor
    ctx.fillRect(0, 0, width, height)
  }
  private initChart() {
    switch (this.options.type) {
      case 'bar':
        this.chart = new BarChart(this)
        break
      case 'line':
        this.chart = new LineChart(this)
        break
      case 'pie':
        this.chart = new PieChart(this)
        break
      case 'ring':
        this.chart = new RingChart(this)
        break
    }
  }
  private initCanvas() {
    let canvas: HTMLCanvasElement

    if (this.container.tagName === 'CANVAS') {
      canvas = this.container as HTMLCanvasElement
    } else {
      canvas = document.createElement('canvas')
      const { width, height } = this.$container.offset()
      canvas.width = px(width)
      canvas.height = px(height)
      this.$container.append(canvas)
    }

    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.canvas = canvas
  }
}

module.exports = Chart
module.exports.default = Chart
