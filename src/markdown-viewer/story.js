import 'luna-markdown-viewer.css'
import MarkdownViewer from 'luna-markdown-viewer.js'
import story from '../share/story'
import readme from './README.md'
import markdownIt from './MARKDOWN_IT.md'

const def = story(
  'markdown-viewer',
  (container) => {
    const markdownViewer = new MarkdownViewer(container, {
      markdown: readme + markdownIt,
    })

    return markdownViewer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { markdownViewer } = def
