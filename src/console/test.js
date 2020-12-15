const Console = require('./index')
require('./style.scss')
require('./icon.css')

const container = document.createElement('div')
document.body.appendChild(container)

const console = new Console(container, {
  asyncRender: false,
})
console.log({ a: 1 })

describe('console', function () {
  it('basic', function () {
    expect(container.innerHTML).to.not.equal('test')
  })
})
