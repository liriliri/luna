import SyntaxHighlighter from './index'
import test from '../share/test'

test('syntax-highlighter', (container) => {
  const syntaxHighlighter = new SyntaxHighlighter(container)

  it('basic', () => {
    syntaxHighlighter.setOption('code', 'const a = 1;')
  })

  return syntaxHighlighter
})
