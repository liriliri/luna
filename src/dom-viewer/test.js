const DomViewer = require('./index')
require('./style.scss')
require('./icon.css')

const container = document.createElement('div')
document.body.appendChild(container)

const domViewer = new DomViewer(container)

describe('dom-viewer', function () {
  it('basic', function () {
    domViewer.expand()
    domViewer.collapse()
  })
})
