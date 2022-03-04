import Chart from './index'
import test from '../share/test'

test('chart', (container) => {
  $(container).css({
    width: 600,
    height: 300,
  })

  it('bar', function () {
    const chart = new Chart(container, {
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

    expect(chart).to.be.an('object')
  })
})
