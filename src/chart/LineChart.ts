import BarChart from './BarChart'
import { px } from './util'

export default class LineChart extends BarChart {
  draw() {
    this.beforeDraw()
    this.drawXAxis()
    this.drawYAxis()
    this.drawLines()
    this.drawLegend()
  }
  private drawLines() {
    const { chart } = this
    const { ctx, canvas } = chart
    const { datasets } = chart.getOption('data')
    const padding = chart.getOption('padding')

    const len = datasets.length
    const ratio = this.yLen / this.ySpace

    for (let i = 0; i < len; i++) {
      const { bgColor, data, label } = datasets[i]
      this.legendTextWidth += Math.ceil(ctx.measureText(label).width)
      for (let j = 0, len = data.length; j < len; j++) {
        ctx.fillStyle = bgColor
        const x = padding.left + this.xLen * (j + 1 / 2)
        const y = canvas.height - padding.bottom - data[j] * ratio
        ctx.beginPath()
        ctx.arc(x, y, px(3), 0, 2 * Math.PI, true)
        ctx.fill()
        if (j !== 0) {
          ctx.beginPath()
          ctx.strokeStyle = bgColor
          ctx.lineWidth = px(2)
          ctx.moveTo(
            x - this.xLen,
            canvas.height - padding.bottom - data[j - 1] * ratio
          )
          ctx.lineTo(x, y)
          ctx.stroke()
        }
        this.drawVal(data[j], x, y - px(10))
      }
    }
  }
  protected drawLegendIcon(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { ctx } = this.chart
    ctx.beginPath()
    ctx.strokeStyle = ctx.fillStyle
    ctx.lineWidth = px(2)
    ctx.moveTo(x, y + height / 2)
    ctx.lineTo(x + width, y + height / 2)
    ctx.stroke()
    ctx.arc(x + px(10), y + px(5), px(3), 0, 2 * Math.PI, true)
    ctx.fill()
  }
}
