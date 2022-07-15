import Keyboard from './index'
import test from '../share/test'

test('keyboard', (container) => {
  const keyboard = new Keyboard(container)
  it('basic', function () {
    keyboard.setInput('test')
  })
})
