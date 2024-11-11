import 'luna-file-list.css'
import FileList from 'luna-file-list.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'file-list',
  (container) => {
    const fileList = new FileList(container)

    return fileList
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { fileList } = def
