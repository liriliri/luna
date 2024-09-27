import 'luna-dom-viewer.css'
import h from 'licia/h'
import DomViewer from 'luna-dom-viewer.js'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'

const def = story(
  'dom-viewer',
  (wrapper) => {
    const test = h('div')
    const root = test.attachShadow({ mode: 'open' })
    root.innerHTML = `<span style="display:none;">Shadow DOM</span>`

    const container = h('div')
    const domViewer = new DomViewer(container, {
      ignore(node) {
        if (node.tagName === 'STYLE') {
          return true
        }
        return false
      },
    })
    domViewer.expand()

    wrapper.appendChild(test)
    wrapper.appendChild(container)

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
