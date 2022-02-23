import MarkdownViewer from './index'
import './style.scss'
import test from '../share/test'

test('markdown-viewer', (container) => {
  it('basic', () => {
    const markdownViewer = new MarkdownViewer(container)
    markdownViewer.destroy()
  })
})
