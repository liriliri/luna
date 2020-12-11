const ObjectViewer = require('./index')
require('./style.scss')
require('./icon.css')

const container = document.createElement('div')
document.body.appendChild(container)

const objectViewer = new ObjectViewer(container, {
  unenumerable: true,
  accessGetter: true,
})

objectViewer.set({ a: 1 })

describe('object-viewer', function () {
  it('basic', function () {
    expect(container.innerHTML).to.not.equal('lalal')
  })
})
