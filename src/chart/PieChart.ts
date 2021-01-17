import BaseChart from './BarChart'

export default class PieChart extends BaseChart {
  draw() {
    const { ctx } = this.chart
    ctx.beginPath()
  }
}
