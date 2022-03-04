import Window from './index'
import test from '../share/test'

test('window', () => {
  const win = new Window({
    title: 'Window Title',
    x: 50,
    y: 50,
    width: 800,
    height: 600,
    content: 'This is the content.',
  })

  it('basic', function () {
    win.show()
  })

  return win
})
