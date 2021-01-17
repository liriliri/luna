import Chart from './index'

export default abstract class BaseChart {
  protected chart: Chart
  constructor(chart: Chart) {
    this.chart = chart
  }
  abstract draw(): void
}
