import BaseChart from './BaseChart'

export default class RingChart extends BaseChart {
  draw() {
    const { ctx } = this.chart
    ctx.beginPath()
  }
}
