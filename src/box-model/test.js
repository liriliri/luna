import BoxModel from './index'
import test from '../share/test'

test('box-model', (container) => {
  const boxModel = new BoxModel(container)
  it('basic', function () {
    boxModel.setOption('element', document.body)
  })
})
