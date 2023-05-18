import Toolbar from './index'
import test from '../share/test'

test('toolbar', (container) => {
  const toolbar = new Toolbar(container)
  it('basic', function () {
    toolbar.appendText('Test')
  })
})
