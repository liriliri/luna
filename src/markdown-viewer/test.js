import MarkdownViewer from './index'
import test from '../share/test'

test('markdown-viewer', (container) => {
  const markdownViewer = new MarkdownViewer(container)

  it('basic', () => {
    markdownViewer.setOption('markdown', '# h1')
  })

  return markdownViewer
})
