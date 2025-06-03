import DragSelector from './index'
import test from '../share/test'
import h from 'licia/h'

test('drag-selector', (container) => {
  const item = h('div')
  container.appendChild(item)
  const dragSelector = new DragSelector(container)

  it('basic', function () {
    expect(dragSelector.isSelected(item)).to.be.false
  })

  return dragSelector
})
