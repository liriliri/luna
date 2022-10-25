import 'luna-dom-viewer.css'
import DomViewer from 'luna-dom-viewer.js'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'

const def = story(
  'dom-viewer',
  (container) => {
    const domViewer = new DomViewer(container, {
      ignore(node) {
        if (node.tagName === 'STYLE') {
          return true
        }
        return false
      },
    })
    domViewer.expand()

    return domViewer
  },
  {
    readme,
    changelog,
    source: __STORY__,
  }
)

export default def

export const { domViewer } = def
