import 'luna-editor.css'
import Editor from 'luna-editor.js'
import h from 'licia/h'
import $ from 'licia/$'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'editor',
  (wrapper) => {
    $(wrapper).html('')

    const toolbarContainer = h('div')
    $(toolbarContainer).css({
      border: '1px solid #eee',
    })
    const toolbar = new Editor.Toolbar(toolbarContainer)
    wrapper.appendChild(toolbarContainer)

    const editorContainer = h('div')
    $(editorContainer).css({
      marginTop: 10,
    })
    editorContainer.innerHTML = 'Luna Editor'
    wrapper.appendChild(editorContainer)
    const editor = new Editor(editorContainer, {
      toolbar,
    })

    return editor
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { editor } = def
