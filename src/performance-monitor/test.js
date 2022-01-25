const PerformanceMonitor = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const performanceMonitor = new PerformanceMonitor(container, {
  title: 'Test',
  data: () => 1,
})
performanceMonitor.start()

describe('performance-monitor', function () {
  it('basic', function (done) {
    const $title = $(container).find(performanceMonitor.c('.title'))
    setTimeout(() => {
      expect($title.text()).to.equal('Test1')
      done()
    }, 20)
  })
})
