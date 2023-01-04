import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid'
import story from '../share/story'
import readme from './README.md'
import each from 'licia/each'
import toEl from 'licia/toEl'
import { object, number, button, text } from '@storybook/addon-knobs'

const def = story(
  'data-grid',
  (container) => {
    const columns = object('Columns', [
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
    ])

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

    const dataGrid = new DataGrid(container, {
      columns,
      maxHeight,
      minHeight,
      filter,
    })

    const data = [
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

    each(data, (item) => dataGrid.append(item, { selectable: true }))

    let selectedNode
    dataGrid.on('select', (node) => (selectedNode = node))
    dataGrid.on('deselect', () => (selectedNode = null))
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
    source: __STORY__,
  }
)

export default def

export const { dataGrid } = def
