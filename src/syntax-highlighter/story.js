import 'luna-syntax-highlighter.css'
import SyntaxHighlighter from 'luna-syntax-highlighter.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'syntax-highlighter',
  (container) => {
    const syntaxHighlighter = new SyntaxHighlighter(container)

    return syntaxHighlighter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { syntaxHighlighter } = def
