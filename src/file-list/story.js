import 'luna-file-list.css'
import FileList from 'luna-file-list.js'
import readme from './README.md'
import story from '../share/story'
import { boolean } from '@storybook/addon-knobs'
import files from './files.json'

const def = story(
  'file-list',
  (container) => {
    const listView = boolean('List View', false)

    const fileList = new FileList(container, {
      listView,
      files,
    })

    return fileList
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { fileList } = def
