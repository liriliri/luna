import 'luna-file-list.css'
import FileList from 'luna-file-list.js'
import $ from 'licia/$'
import readme from './README.md'
import story from '../share/story'
import LunaFileList from './react'
import { boolean, text } from '@storybook/addon-knobs'

const def = story(
  'file-list',
  (container) => {
    $(container).css({
      height: '200px',
    })

    const { listView, filter } = createKnobs()

    const fileList = new FileList(container, {
      listView,
      filter,
      files: getFiles(),
    })

    fileList.on('select', (file) => {
      console.log('select', file)
    })
    fileList.on('deselect', () => {
      console.log('deselect')
    })
    fileList.on('click', (e, file) => {
      console.log('click', file)
    })
    fileList.on('dblclick', (e, file) => {
      console.log('dblclick', file)
    })
    fileList.on('contextmenu', (e, file) => {
      console.log('contextmenu', file)
    })

    return fileList
  },
  {
    readme,
    i18n: FileList.i18n,
    story: __STORY__,
    ReactComponent({ theme }) {
      const { listView, filter } = createKnobs()

      return (
        <LunaFileList
          theme={theme}
          filter={filter}
          style={{
            height: 200,
          }}
          onSelect={(file) => {
            console.log('select', file)
          }}
          onDeselect={() => {
            console.log('deselect')
          }}
          onClick={(e, file) => {
            console.log('click', file)
          }}
          onDoubleClick={(e, file) => {
            console.log('dblclick', file)
          }}
          onContextMenu={(e, file) => {
            console.log('contextmenu', file)
          }}
          listView={listView}
          files={getFiles()}
        />
      )
    },
  }
)

function getFiles() {
  return [
    {
      name: 'test.txt',
      size: 1024,
      directory: false,
      mtime: randomDate(),
    },
    {
      name: 'folder 1',
      directory: true,
      mtime: randomDate(),
    },
    {
      name: 'picture.jpg',
      thumbnail: '',
      size: 2048,
      directory: false,
      mtime: randomDate(),
    },
    {
      name: 'pic1.png',
      thumbnail: '/pic1.png',
      mtime: randomDate(),
    },
    {
      name: 'binary',
      size: 4096,
      directory: false,
      mtime: randomDate(),
    },
    {
      name: 'video.mp4',
      size: 8192,
      directory: false,
      mtime: randomDate(),
    },
    {
      name: 'audio.mp3',
      size: 16384,
      mtime: randomDate(),
    },
  ]
}

function randomDate() {
  return new Date(Date.now() - Math.random() * 10000000000)
}

function createKnobs() {
  const filter = text('Filter', '')
  const listView = boolean('List View', false)

  return {
    filter,
    listView,
  }
}

export default def

export const { fileList: html, react } = def
