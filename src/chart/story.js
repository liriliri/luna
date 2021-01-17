import Chart from 'luna-chart.js'
import readme from './README.md'
import story from '../share/story'
import { object, color } from '@storybook/addon-knobs'
import h from 'licia/h'
import $ from 'licia/$'
import { px } from './util'

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
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
          width: px(600),
          height: px(400),
        })
        .css({
          width: 600,
          height: 400,
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

    const barChart = new Chart(createCanvas(), {
      type: 'bar',
      bgColor,
      title: barTitle,
      data: {
        labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
          {
            label: 'Dataset 1',
            bgColor: chartColors.red,
            data: [128, 146, 56, 84, 222],
          },
          {
            label: 'Dataset 2',
            bgColor: chartColors.blue,
            data: [119, 23, 98, 67, 88],
          },
        ],
      },
    })

    const lineTitle = object('Line Title', {
      text: 'Line Chart',
    })

    const lineChart = new Chart(createCanvas(), {
      type: 'line',
      bgColor,
      title: lineTitle,
    })

    const pieTitle = object('Pie Title', {
      text: 'Pie Chart',
    })

    const pieChart = new Chart(createCanvas(), {
      type: 'pie',
      bgColor,
      title: pieTitle,
    })

    const ringTitle = object('Ring Title', {
      text: 'Ring Chart',
    })

    const ringChart = new Chart(createCanvas(), {
      type: 'ring',
      bgColor,
      title: ringTitle,
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
