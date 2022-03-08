import 'luna-syntax-highlighter.css'
import SyntaxHighlighter from 'luna-syntax-highlighter.js'
import readme from './README.md'
import story from '../share/story'
import { text } from '@storybook/addon-knobs'
import componentCode from '!!raw-loader!./index'
import $ from 'licia/$'

const def = story(
  'syntax-highlighter',
  (container) => {
    $(container).css({ maxHeight: window.innerHeight - 50 })

    const code = text('Code', componentCode)

    const syntaxHighlighter = new SyntaxHighlighter(container, {
      code,
      language: 'javascript',
    })

    return syntaxHighlighter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { syntaxHighlighter } = def
