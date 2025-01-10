import 'luna-file-list.css'
import FileList from 'luna-file-list.js'
import $ from 'licia/$'
import readme from './README.md'
import story from '../share/story'
import { boolean } from '@storybook/addon-knobs'

const def = story(
  'file-list',
  (container) => {
    $(container).css({
      width: '100%',
      height: '200px',
    })

    const listView = boolean('List View', false)

    const fileList = new FileList(container, {
      listView,
      files: getFiles(),
    })

    return fileList
  },
  {
    readme,
    story: __STORY__,
  }
)

function getFiles() {
  return [
    {
      name: 'test.txt',
      size: 1024,
      directory: false,
    },
    {
      name: 'folder 1',
      directory: true,
    },
    {
      name: 'picture.jpg',
      thumbnail: '',
      size: 2048,
      directory: false,
    },
  ]
}

export default def
export const { fileList } = def
