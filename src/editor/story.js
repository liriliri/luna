import 'luna-editor.css'
import Editor from 'luna-editor.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'editor',
  (container) => {
    container.innerHTML = 'Luna Editor'
    const editor = new Editor(container)

    return editor
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { editor } = def
