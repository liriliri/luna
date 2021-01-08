const Editor = require('./index')
require('./style.scss')
require('./icon.css')

const container = document.createElement('div')
document.body.appendChild(container)
container.innerHTML = 'luna'

const editor = new Editor(container)

describe('editor', function () {
  it('basic', function () {
    expect(editor.html()).to.equal('luna')
  })
})
