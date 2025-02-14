import VirtualList from './index'
import test from '../share/test'

test('virtual-list', (container) => {
  const virtualList = new VirtualList(container)

  it('basic', () => {
    virtualList.append(document.createElement('div'))
  })

  return virtualList
})
