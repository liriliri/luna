import 'luna-file-list.css'
import FileList from 'luna-file-list.js'
import $ from 'licia/$'
import readme from './README.md'
import story from '../share/story'
import LunaFileList from './react'
import { boolean, text, object } from '@storybook/addon-knobs'

const def = story(
  'file-list',
  (container) => {
    $(container).css({
      height: '200px',
    })

    const { listView, filter, columns } = createKnobs()

    const fileList = new FileList(container, {
      listView,
      filter,
      files: getFiles(),
      columns,
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
      const { listView, filter, columns } = createKnobs()

      return (
        <LunaFileList
          theme={theme}
          filter={filter}
          columns={columns}
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
      mode: 33188,
    },
    {
      name: 'folder 1',
      directory: true,
      mtime: randomDate(),
      mode: 'drwxrws---',
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
      mime: 'video/mp4',
    },
    {
      name: 'audio.mp3',
      size: 16384,
      mtime: randomDate(),
      mime: 'audio/mpeg',
    },
    {
      name: 'empty',
      size: 0,
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
  const columns = object('Columns', ['name', 'mode', 'mtime', 'type', 'size'])

  return {
    filter,
    listView,
    columns,
  }
}

export default def

export const { fileList: html, react } = def
