import 'luna-file-bar.css'
import FileBar from 'luna-file-bar.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'file-bar',
  (container) => {
    const fileBar = new FileBar(container)

    return fileBar
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def

export const { fileBar } = def
