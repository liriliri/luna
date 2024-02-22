import MaskEditor from './index'
import test from '../share/test'

test('mask-editor', (container) => {
  const maskEditor = new MaskEditor(container, {})
  it('basic', function () {
    maskEditor.getCanvas()
  })
})
