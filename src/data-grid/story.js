import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'data-grid',
  (container) => {
    const dataGrid = new DataGrid(container, {
      columns: [
        {
          id: 'index',
          title: 'Index',
        },
        {
          id: 'name',
          title: 'Name',
        },
        {
          id: 'site',
          title: 'Site',
        },
      ],
    })

    dataGrid.append({
      index: 0,
      name: 'Runoob',
      site: 'www.runoob.com',
    })

    dataGrid.append({
      index: 1,
      name: 'Google',
      site: 'www.google.com',
    })

    dataGrid.append({
      index: 2,
      name: 'Taobao',
      site: 'www.taobao.com',
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
