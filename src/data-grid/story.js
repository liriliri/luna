import 'luna-data-grid.css'
import DataGrid from 'luna-data-grid.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'data-grid',
  (container) => {
    const dataGrid = new DataGrid()

    return dataGrid
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { dataGrid } = def
