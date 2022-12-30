import 'luna-syntax-highlighter.css'
import SyntaxHighlighter from 'luna-syntax-highlighter.js'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import story from '../share/story'
import { text, boolean, optionsKnob, number } from '@storybook/addon-knobs'
import componentCode from '!!raw-loader!./index'

const def = story(
  'syntax-highlighter',
  (container) => {
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
    const maxHeight = number('Max Height', 400, {
      range: true,
      min: 50,
      max: 2000,
    })

    const syntaxHighlighter = new SyntaxHighlighter(container, {
      code,
      language,
      showLineNumbers,
      wrapLongLines,
      maxHeight,
    })

    return syntaxHighlighter
  },
  {
    readme,
    changelog,
    source: __STORY__,
    themes: {
      'Vs Dark': 'vs-dark',
    },
  }
)

export default def

export const { syntaxHighlighter } = def
