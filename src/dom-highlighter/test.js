import DomHighlighter from './index'
import test from '../share/test'

test('dom-highlighter', (container) => {
  const domHighlighter = new DomHighlighter(container, {
    showRulers: true,
  })

  it('basic', function () {
    domHighlighter.highlight(document.body)
    domHighlighter.hide()
  })

  return domHighlighter
})
