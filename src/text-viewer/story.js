import 'luna-text-viewer.css'
import TextViewer from 'luna-text-viewer.js'
import readme from './README.md'
import story from '../share/story'
import { text, boolean } from '@storybook/addon-knobs'
import $ from 'licia/$'

const def = story(
  'text-viewer',
  (container) => {
    $(container).css({ maxHeight: window.innerHeight - 50 })

    const txt = text('Text', readme)
    const showLineNumbers = boolean('Show Line Numbers', true)
    const wrapLongLines = boolean('Wrap Long Lines', true)

    const textViewer = new TextViewer(container, {
      text: txt,
      showLineNumbers,
      wrapLongLines,
    })

    return textViewer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { textViewer } = def
