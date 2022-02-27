import 'luna-markdown-viewer.css'
import MarkdownViewer from 'luna-markdown-viewer.js'
import story from '../share/story'
import readme from './README.md'

const markdown = `# h1
## h2
`

const def = story(
  'markdown-viewer',
  (container) => {
    const markdownViewer = new MarkdownViewer(container, {
      markdown,
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
