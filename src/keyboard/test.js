import Keyboard from './index'
import test from '../share/test'

test('keyboard', (container) => {
  const keyboard = new Keyboard(container)
  let input = ''
  keyboard.on('change', (val) => (input = val))
  it('basic', function () {
    $('li[data-key="49"]').click()
    expect(input).to.equal('1')
  })
})
