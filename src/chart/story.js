import Chart from 'luna-chart.js'
import readme from './README.md'
import story from '../share/story'
import { object, color } from '@storybook/addon-knobs'
import h from 'licia/h'
import $ from 'licia/$'
import { px } from './util'
import { red5, purple5, orange5, blue5, green5 } from '../share/theme'

const chartColors = {
  primary: red5,
  secondary: purple5,
  orange: orange5,
  blue: blue5,
  green: green5,
}

const def = story(
  'chart',
  (wrapper) => {
    $(wrapper).html('')

    function createCanvas() {
      const canvas = h('canvas')
      const $canvas = $(canvas)
      $canvas
        .attr({
          width: px(640),
          height: px(360),
        })
        .css({
          maxWidth: 640,
          width: '100%',
          display: 'block',
          margin: '0 auto 10px',
        })

      $(wrapper).append(canvas)

      return canvas
    }

    const bgColor = color('Background Color', '#fbfbfb')

    const barTitle = object('Bar Title', {
      text: 'Bar Chart',
    })
    const barData = object('Bar Data', {
      labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
      datasets: [
        {
          label: 'Dataset 1',
          bgColor: chartColors.primary,
          data: [128, 146, 56, 84, 222],
        },
        {
          label: 'Dataset 2',
          bgColor: chartColors.secondary,
          data: [119, 23, 98, 67, 88],
        },
      ],
    })

    const barChart = new Chart(createCanvas(), {
      type: 'bar',
      bgColor,
      title: barTitle,
      data: barData,
    })

    const lineTitle = object('Line Title', {
      text: 'Line Chart',
    })
    const lineData = object('Line Data', {
      labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
      datasets: [
        {
          label: 'Dataset 1',
          bgColor: chartColors.primary,
          data: [55, 106, 180, 333, 288],
        },
        {
          label: 'Dataset 2',
          bgColor: chartColors.secondary,
          data: [125, 58, 111, 250, 365],
        },
      ],
    })

    const lineChart = new Chart(createCanvas(), {
      type: 'line',
      bgColor,
      title: lineTitle,
      data: lineData,
    })

    const pieTitle = object('Pie Title', {
      text: 'Pie Chart',
    })
    const pieData = object('Pie Data', {
      labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
      datasets: [
        {
          bgColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.orange,
            chartColors.blue,
            chartColors.green,
          ],
          data: [55, 106, 180, 333, 288],
        },
      ],
    })

    const pieChart = new Chart(createCanvas(), {
      type: 'pie',
      bgColor,
      title: pieTitle,
      data: pieData,
    })

    const ringTitle = object('Ring Title', {
      text: 'Ring Chart',
    })
    const ringData = object('Ring Data', {
      labels: ['Red', 'Purple', 'Blue'],
      datasets: [
        {
          bgColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.blue,
          ],
          data: [300, 50, 100],
        },
      ],
    })

    const ringChart = new Chart(createCanvas(), {
      type: 'ring',
      bgColor,
      title: ringTitle,
      data: ringData,
    })

    return [barChart, lineChart, pieChart, ringChart]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { chart } = def
