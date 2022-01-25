import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import types from 'licia/types'
import $ from 'licia/$'
import raf from 'licia/raf'
import perfNow from 'licia/perfNow'
import last from 'licia/last'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import now from 'licia/now'
import dateFormat from 'licia/dateFormat'
import Color from 'licia/Color'

interface IOptions {
  title: string
  data: types.Fn<number>
  smooth?: boolean
  unit?: string
  color?: string
  max?: number
}

interface IMetric {
  timestamp: number
  value: number
}

const POLL_INTERVAL_MS = 500
const LABEL_DISTANCE_SECONDS = 10
const PIXELS_PER_MS = 10 / 1000
const GRID_COLOR = 'rgb(0 0 0 / 8%)'

// https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/panels/performance_monitor/PerformanceMonitor.ts
export default class PerformanceMonitor extends Component<IOptions> {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number
  private width = 0
  private height = 0
  private pollTimer: any
  private curMax = 0
  private fillColor = ''
  private metricBuffer: IMetric[] = []
  private resizeSensor: ResizeSensor
  private $value: $.$
  constructor(
    container: HTMLElement,
    {
      title,
      data,
      smooth = true,
      unit = '',
      color = '#1a73e8',
      max = 0,
    }: IOptions
  ) {
    super(container, { compName: 'performance-monitor' })

    this.options = {
      title,
      data,
      unit,
      smooth,
      color,
      max,
    }

    this.fillColor = getLightColor(color, 0.2)

    this.initTpl()
    this.$value = this.find('.value')
    this.$value.css('color', color)

    const canvas = document.createElement('canvas')
    $(canvas).addClass(this.c('chart'))
    this.$container.append(canvas)
    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    this.resizeSensor = new ResizeSensor(container)

    this.bindEvent()
  }
  destroy() {
    this.stop()
    this.resizeSensor.destroy()
    super.destroy()
    this.metricBuffer = []
  }
  start() {
    this.pollTimer = setInterval(this.poll, POLL_INTERVAL_MS)
    this.poll()
    this.onResize()

    const animate = () => {
      this.draw()
      this.animationId = raf(animate)
    }
    animate()
  }
  stop() {
    clearInterval(this.pollTimer)
    raf.cancel.call(window, this.animationId)
  }
  private bindEvent() {
    this.resizeSensor.addListener(throttle(() => this.onResize(), 16))
  }
  private poll = () => {
    const { metricBuffer } = this

    const data = this.options.data()
    this.metricBuffer.push({
      timestamp: perfNow(),
      value: data,
    })
    const millisPerWidth = this.width / PIXELS_PER_MS
    const maxCount = Math.ceil((millisPerWidth / POLL_INTERVAL_MS) * 2)
    if (this.metricBuffer.length > maxCount * 2) {
      metricBuffer.splice(0, metricBuffer.length - maxCount)
    }
    this.$value.text(data + this.options.unit)
  }
  private onResize = () => {
    const { canvas } = this
    this.width = canvas.offsetWidth
    canvas.width = Math.round(this.width * window.devicePixelRatio)
    this.height = 100
    canvas.height = this.height * window.devicePixelRatio
  }
  private draw() {
    const { ctx, width, height } = this

    ctx.clearRect(0, 0, width, height)
    this.drawChart()
    this.drawHorizontalGrid()
  }
  private drawChart() {
    const { ctx } = this
    const { color } = this.options

    const extraSpace = 1.05
    const max = this.calcMax() * extraSpace

    const path = this.buildMetricPath(max)

    ctx.save()
    ctx.fillStyle = this.fillColor
    ctx.fill(path)
    ctx.strokeStyle = color
    ctx.lineWidth = 0.5
    ctx.stroke(path)
    ctx.restore()

    this.drawVerticalGrid(max)
  }
  private buildMetricPath(max: number) {
    const { width, height, metricBuffer } = this
    const { smooth } = this.options

    const path = new Path2D()
    const topPadding = 18
    const visibleHeight = height - topPadding
    const startTime = perfNow() - POLL_INTERVAL_MS - width / PIXELS_PER_MS

    let x = 0
    let lastY = 0
    let lastX = 0
    if (metricBuffer.length) {
      x = (metricBuffer[0].timestamp - startTime) * PIXELS_PER_MS
      path.moveTo(x, calcY(0))
      path.lineTo(width + 5, calcY(0))
      lastY = calcY(last(metricBuffer).value)
      lastX = width + 5
      path.lineTo(lastX, lastY)
    }
    for (let i = metricBuffer.length - 1; i >= 0; --i) {
      const metric = metricBuffer[i]
      const timestamp = metric.timestamp
      const value = metric.value
      const y = calcY(value)
      x = (timestamp - startTime) * PIXELS_PER_MS
      if (smooth) {
        const midX = (lastX + x) / 2
        path.bezierCurveTo(midX, lastY, midX, y, x, y)
      } else {
        path.lineTo(x, lastY)
        path.lineTo(x, y)
      }
      lastX = x
      lastY = y
      if (timestamp < startTime) {
        break
      }
    }
    return path

    function calcY(value: number) {
      return Math.round(height - (visibleHeight * value) / max) + 0.5
    }
  }
  private calcMax() {
    if (this.options.max) {
      return this.options.max
    }

    const { width, metricBuffer } = this
    const startTime = perfNow() - POLL_INTERVAL_MS - width / PIXELS_PER_MS
    let max = -Infinity
    for (let i = metricBuffer.length - 1; i >= 0; --i) {
      const metric = metricBuffer[i]
      const value = metric.value
      max = Math.max(max, value)
      if (metric.timestamp < startTime) {
        break
      }
    }
    if (!metricBuffer.length) {
      return 10
    }

    const base10 = Math.pow(10, Math.floor(Math.log10(max)))
    max = Math.ceil(max / base10 / 2) * base10 * 2

    const alpha = 0.2
    this.curMax = max * alpha + (this.curMax || max) * (1 - alpha)
    return this.curMax
  }
  private drawHorizontalGrid() {
    const { ctx } = this

    const lightGray = 'rgb(0 0 0 / 2%)'
    ctx.font = '10px Arial, Helvetica, sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    const currentTime = now() / 1000
    let sec = Math.ceil(currentTime)
    while (--sec) {
      const x =
        this.width -
        ((currentTime - sec) * 1000 - POLL_INTERVAL_MS) * PIXELS_PER_MS
      if (x < -50) {
        break
      }
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      if (sec >= 0 && sec % LABEL_DISTANCE_SECONDS === 0) {
        ctx.fillText(dateFormat(new Date(sec * 1000), 'HH:MM:ss'), x + 4, 12)
      }
      ctx.strokeStyle = sec % LABEL_DISTANCE_SECONDS ? lightGray : GRID_COLOR
      ctx.stroke()
    }
  }
  private drawVerticalGrid(max: number) {
    const { ctx, height } = this
    const { unit } = this.options
    let base = Math.pow(10, Math.floor(Math.log10(max)))
    const firstDigit = Math.floor(max / base)
    if (firstDigit !== 1 && firstDigit % 2 === 1) {
      base *= 2
    }
    let scaleValue = Math.floor(max / base) * base

    const topPadding = 18
    const visibleHeight = height - topPadding
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.strokeStyle = GRID_COLOR
    ctx.beginPath()
    for (let i = 0; i < 2; ++i) {
      const y = calcY(scaleValue)
      const labelText = scaleValue + unit
      ctx.moveTo(0, y)
      ctx.lineTo(4, y)
      ctx.moveTo(ctx.measureText(labelText).width + 12, y)
      ctx.lineTo(this.width, y)
      ctx.fillText(labelText, 8, calcY(scaleValue) + 3)
      scaleValue /= 2
    }
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, height + 0.5)
    ctx.lineTo(this.width, height + 0.5)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.stroke()
    function calcY(value: number) {
      return Math.round(height - (visibleHeight * value) / max) + 0.5
    }
  }
  private initTpl() {
    const { title } = this.options

    this.$container.html(
      this.c(stripIndent`
      <div class="title">${title}<span class="value"></span></div>
      `)
    )
  }
}

function getLightColor(color: string, opacity: number) {
  const colorObj = new Color(color)
  const rgbColor = colorObj.toRgb()
  const rgbColorObj = Color.parse(rgbColor)
  rgbColorObj.val[3] = opacity
  return new Color(rgbColorObj).toRgb()
}

module.exports = PerformanceMonitor
module.exports.default = PerformanceMonitor
