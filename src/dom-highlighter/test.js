const DomHighlighter = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const domHighlighter = new DomHighlighter(container, {
  showRulers: true,
})

describe('dom-highlighter', function () {
  it('basic', function () {
    domHighlighter.highlight(document.body)
    domHighlighter.hide()
  })
})
