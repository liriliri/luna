import 'luna-dom-viewer.css'
import DomViewer from 'luna-dom-viewer.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'dom-viewer',
  (container) => {
    const domViewer = new DomViewer(container)
    domViewer.expand()

    return domViewer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { domViewer } = def
