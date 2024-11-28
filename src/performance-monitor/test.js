import PerformanceMonitor from './index'
import test from '../share/test'

test('performance-monitor', (container) => {
  const performanceMonitor = new PerformanceMonitor(container, {
    title: 'Test',
    data: () => 1,
  })
  performanceMonitor.start()

  it('basic', function (done) {
    const $title = $(container).find(performanceMonitor.c('.title'))
    setTimeout(() => {
      expect($title.text()).to.equal('Test')
      done()
    }, 20)
  })

  return performanceMonitor
})
