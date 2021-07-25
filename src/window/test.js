const Window = require('./index')
require('./style.scss')

const win = new Window({
  title: 'Window Title',
  x: 50,
  y: 50,
  width: 800,
  height: 600,
  content: 'This is the content.',
})

describe('window', function () {
  it('basic', function () {
    win.show()
  })
})
