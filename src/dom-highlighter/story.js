import 'luna-dom-highlighter.css'
import DomHighlighter from 'luna-dom-highlighter.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'dom-highlighter',
  (container) => {
    const domHighlighter = new DomHighlighter(container)
    domHighlighter.highlight()

    return domHighlighter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { domHighlighter } = def
