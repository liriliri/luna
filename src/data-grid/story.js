import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import each from 'licia/each'
import toEl from 'licia/toEl'
import LunaDataGrid from './react'
import { number, button, text } from '@storybook/addon-knobs'

const def = story(
  'data-grid',
  (container) => {
    const { maxHeight, minHeight, filter } = createKnobs()

    const dataGrid = new DataGrid(container, {
      columns: getColumns(),
      maxHeight,
      minHeight,
      filter,
    })

    each(getData(), (item) => dataGrid.append(item, { selectable: true }))

    let selectedNode
    dataGrid.on('select', (node) => {
      selectedNode = node
      console.log('select', node)
    })
    dataGrid.on('deselect', () => {
      selectedNode = null
      console.log('deselect')
    })
    dataGrid.on('click', (e, node) => console.log('click', node))
    dataGrid.on('dblclick', (e, node) => console.log('dblclick', node))
    dataGrid.on('contextmenu', (e, node) => console.log('contextmenu', node))

    button('Append 10000 items', () => {
      for (let i = 0; i < 10000; i++) {
        dataGrid.append(
          {
            index: i,
            name: 'Luna',
            site: 'luna.liriliri.io',
          },
          {
            selectable: true,
          }
        )
      }

      return false
    })

    button('Remove Selected', () => {
      if (selectedNode) {
        dataGrid.remove(selectedNode)
      }
      return false
    })

    button('Clear', () => {
      dataGrid.clear()
      return false
    })

    return dataGrid
  },
  {
    readme,
    changelog,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { minHeight, maxHeight, filter } = createKnobs()

      return (
        <LunaDataGrid
          onSelect={(node) => {
            console.log('select', node)
          }}
          onDeselect={() => {
            console.log('deselect')
          }}
          onClick={(e, node) => {
            console.log('click', node)
          }}
          onDoubleClick={(e, node) => {
            console.log('dblclick', node)
          }}
          onContextMenu={(e, node) => {
            console.log('contextmenu', node)
          }}
          columns={getColumns()}
          minHeight={minHeight}
          maxHeight={maxHeight}
          filter={filter}
          theme={theme}
          selectable={true}
          data={getData()}
        />
      )
    },
  }
)

function getColumns() {
  return [
    {
      id: 'index',
      title: 'Index',
      weight: 20,
      sortable: true,
    },
    {
      id: 'name',
      title: 'Name',
      sortable: true,
      weight: 30,
    },
    {
      id: 'site',
      title: 'Site',
    },
  ]
}

function getData() {
  return [
    {
      index: 1,
      name: 'Runoob',
      site: 'www.runoob.com',
    },
    {
      index: 2,
      name: 'Google',
      site: 'www.google.com',
    },
    {
      index: 0,
      name: 'Taobao',
      site: 'www.taobao.com',
    },
    {
      index: 3,
      name: 'Bilibili',
      site: 'www.bilibili.com',
    },
    {
      index: 4,
      name: 'Baidu',
      site: 'www.baidu.com',
    },
    {
      index: 5,
      name: 'Zhihu',
      site: 'www.zhihu.com',
    },
    {
      index: 6,
      name: 'Twitter',
      site: 'www.twitter.com',
    },
    {
      index: 7,
      name: toEl('<span style="color:red">Luna</span>'),
      site: 'luna.liriliri.io',
    },
  ]
}

function createKnobs() {
  const minHeight = number('Min Height', 80, {
    range: true,
    min: 23,
    max: 500,
  })

  const maxHeight = number('Max Height', 100, {
    range: true,
    min: 50,
    max: 1000,
  })
  const filter = text('Filter', '')

  return {
    minHeight,
    maxHeight,
    filter,
  }
}

export default def

export const { dataGrid: html, react } = def
