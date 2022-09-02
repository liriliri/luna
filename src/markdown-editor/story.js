import 'luna-markdown-editor.css'
import MarkdownEditor from 'luna-markdown-editor.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'markdown-editor',
  (container) => {
    const markdownEditor = new MarkdownEditor(container, {
      markdown: readme,
    })

    return markdownEditor
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { markdownEditor } = def
