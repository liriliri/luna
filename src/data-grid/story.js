import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid'
import story from '../share/story'
import readme from './README.md'
import each from 'licia/each'
import { object } from '@storybook/addon-knobs'

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

    const dataGrid = new DataGrid(container, {
      columns,
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
