const Chart = require('./index')

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.width = 600
canvas.width = 300

new Chart(canvas, {
  type: 'bar',
  bgColor: '#fbfbfb',
  title: {
    text: 'Bar Chart',
  },
  data: {
    labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Dataset 1',
        bgColor: '#e73c5e',
        data: [128, 146, 56, 84, 222],
      },
      {
        label: '#614d82',
        bgColor: '#614d82',
        data: [119, 23, 98, 67, 88],
      },
    ],
  },
})
