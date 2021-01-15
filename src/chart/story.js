import Chart from 'luna-chart.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'chart',
  (container) => {
    const chart = new Chart()

    return chart
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { chart } = def
