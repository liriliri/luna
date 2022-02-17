import 'luna-data-grid.css'
import DataGrid, { DataGridNode } from 'luna-data-grid.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'data-grid',
  (container) => {
    console.log(DataGrid, DataGridNode, DataGrid.DataGridNode)
    const dataGrid = new DataGrid(container)

    return dataGrid
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { dataGrid } = def
