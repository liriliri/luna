import DomViewer from './index'
import test from '../share/test'

test('dom-viewer', (container) => {
  const domViewer = new DomViewer(container)

  it('basic', function () {
    domViewer.expand()
    domViewer.collapse()
  })

  return domViewer
})
