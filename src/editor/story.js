import 'luna-editor.css'
import Editor from 'luna-editor.js'
import h from 'licia/h'
import $ from 'licia/$'
import escape from 'licia/escape'
import story from '../share/story'
import readme from './README.md'
import { text } from '@storybook/addon-knobs'

const def = story(
  'editor',
  (wrapper) => {
    $(wrapper).html('')

    const content = text('Initial Content', readme)

    const toolbarContainer = h('div')
    $(toolbarContainer).css({
      border: '1px solid #eee',
    })
    const toolbar = new Editor.Toolbar(toolbarContainer)
    wrapper.appendChild(toolbarContainer)

    const editorContainerA = h('div')
    $(editorContainerA).css('marginTop', 10)
    editorContainerA.innerHTML = escape(content).replace(/\n/g, '<br/>')
    const editorContainerB = h('div')
    $(editorContainerB).css('marginTop', 10)
    editorContainerB.innerHTML = editorContainerA.innerHTML
    wrapper.appendChild(editorContainerA)
    wrapper.appendChild(editorContainerB)

    const editorA = new Editor(editorContainerA, {
      toolbar,
    })

    const editorB = new Editor(editorContainerB)

    return [editorA, editorB]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { editor } = def
