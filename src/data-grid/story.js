import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid'
import story from '../share/story'
import readme from './README.md'
import each from 'licia/each'
import { object, number } from '@storybook/addon-knobs'

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
      min: 0,
      max: 500,
    })

    const maxHeight = number('Max Height', 100, {
      range: true,
      min: 50,
      max: 1000,
    })

    const dataGrid = new DataGrid(container, {
      columns,
      maxHeight,
      minHeight,
    })

    const data = object('Data', [
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
        name: 'Luna',
        site: 'luna.liriliri.io',
      },
    ])

    each(data, (item) => dataGrid.append(item))

    return dataGrid
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { dataGrid } = def
