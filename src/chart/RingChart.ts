import PieChart from './PieChart'
import { px } from './util'

export default class RingChart extends PieChart {
  draw() {
    super.draw()

    const { chart } = this
    const { ctx, canvas } = chart
    const bgColor = chart.getOption('bgColor')

    const x = canvas.width / 2
    const y = canvas.height / 2

    ctx.beginPath()
    ctx.fillStyle = bgColor
    ctx.arc(x, y, px(60), 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
  }
}
