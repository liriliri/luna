import MarkdownViewer from './index'
import test from '../share/test'

test('markdown-viewer', (container) => {
  it('basic', () => {
    const markdownViewer = new MarkdownViewer(container)
    markdownViewer.destroy()
  })
})
