import BaseChart from './BarChart'

export default class LineChart extends BaseChart {
  draw() {
    const { ctx } = this.chart
    ctx.beginPath()
  }
}
