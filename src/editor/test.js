import Editor from './index'
import test from '../share/test'

test('editor', (container) => {
  container.innerHTML = 'luna'
  const editor = new Editor(container)

  it('basic', function () {
    expect(editor.html()).to.equal('luna')
  })

  return editor
})
