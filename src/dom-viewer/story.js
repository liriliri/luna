import 'luna-dom-viewer.css'
import h from 'licia/h'
import DomViewer from 'luna-dom-viewer.js'
import LunaDomViewer from './react'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import { boolean } from '@storybook/addon-knobs'

const def = story(
  'dom-viewer',
  (wrapper) => {
    const test = h('div')
    const root = test.attachShadow({ mode: 'open' })
    root.innerHTML = `<span style="display:none;">Shadow DOM</span>`

    const { observe } = createKnobs()

    const container = h('div')
    const domViewer = new DomViewer(container, {
      observe,
      ignore,
      ignoreAttr,
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
    ReactComponent({ theme }) {
      const { observe } = createKnobs()

      return (
        <LunaDomViewer
          theme={theme}
          observe={observe}
          ignore={ignore}
          ignoreAttr={ignoreAttr}
          onCreate={(domViewer) => domViewer.expand()}
        />
      )
    },
  }
)

function ignore(node) {
  if (node.tagName === 'STYLE') {
    return true
  }
  return false
}

function ignoreAttr(el, name, value) {
  if (name === 'lang') {
    return true
  }
  return false
}

function createKnobs() {
  const observe = boolean('Observe', true)

  return { observe }
}

export default def

export const { domViewer: html, react } = def
