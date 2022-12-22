import TextViewer from './index'
import test from '../share/test'

test('text-viewer', (container) => {
  const textViewer = new TextViewer(container)

  it('basic', () => {
    textViewer.setOption({
      code: 'const a = 1;',
    })
  })

  return textViewer
})
