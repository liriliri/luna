import 'luna-text-viewer.css'
import TextViewer from 'luna-text-viewer.js'
import readme from './README.md'
import story from '../share/story'
import { text, boolean, number, button } from '@storybook/addon-knobs'
import LunaTextViewer from './react'

const def = story(
  'text-viewer',
  (container) => {
    const { txt, showLineNumbers, wrapLongLines, maxHeight } = createKnobs()

    const txtToAppend = text(
      'Text to Append',
      '\n# Luna Text Viewer\n\nText viewer with line number.\n'
    )
    button('Append', () => {
      textViewer.append(txtToAppend)
      return false
    })

    const textViewer = new TextViewer(container, {
      text: txt,
      showLineNumbers,
      wrapLongLines,
      maxHeight,
    })

    return textViewer
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { txt, showLineNumbers, wrapLongLines, maxHeight } = createKnobs()

      return (
        <LunaTextViewer
          text={txt}
          theme={theme}
          showLineNumbers={showLineNumbers}
          wrapLongLines={wrapLongLines}
          maxHeight={maxHeight}
        />
      )
    },
  }
)

function createKnobs() {
  const txt = text('Text', readme)
  const showLineNumbers = boolean('Show Line Numbers', true)
  const wrapLongLines = boolean('Wrap Long Lines', true)

  const maxHeight = number('Max Height', 400, {
    range: true,
    min: 50,
    max: 1000,
  })

  return {
    txt,
    showLineNumbers,
    wrapLongLines,
    maxHeight,
  }
}

export default def

export const { textViewer: html, react } = def
