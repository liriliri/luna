import MarkdownEditor from './index'
import test from '../share/test'

test('markdown-editor', (contianer) => {
  const markdownEditor = new MarkdownEditor(contianer)

  it('basic', () => {
    markdownEditor.markdown('# h1')
    expect(markdownEditor.markdown()).to.equal('# h1')
  })

  return markdownEditor
})