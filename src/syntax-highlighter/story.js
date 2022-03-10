import 'luna-syntax-highlighter.css'
import SyntaxHighlighter from 'luna-syntax-highlighter.js'
import readme from './README.md'
import story from '../share/story'
import { text, boolean, optionsKnob } from '@storybook/addon-knobs'
import componentCode from '!!raw-loader!./index'
import $ from 'licia/$'

const def = story(
  'syntax-highlighter',
  (container) => {
    $(container).css({ maxHeight: window.innerHeight - 50 })

    const code = text('Code', componentCode)
    const language = optionsKnob(
      'Language',
      {
        'HTML, XML': 'xml',
        CSS: 'css',
        JavaScript: 'javascript',
      },
      'javascript',
      { display: 'select' }
    )
    const showLineNumbers = boolean('Show Line Numbers', true)
    const wrapLongLines = boolean('Wrap Long Lines', true)

    const syntaxHighlighter = new SyntaxHighlighter(container, {
      code,
      language,
      showLineNumbers,
      wrapLongLines,
    })

    return syntaxHighlighter
  },
  {
    readme,
    source: __STORY__,
    themes: {
      'Vs Dark': 'vs-dark',
    },
  }
)

export default def

export const { syntaxHighlighter } = def
