import Painter from './index'
import test from '../share/test'

test('painter', (container) => {
  const painter = new Painter(container, {
    width: 512,
    height: 512,
    tool: 'brush',
  })
  it('basic', function () {
    painter.renderCanvas()
  })
})
