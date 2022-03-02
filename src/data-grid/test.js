import DataGrid from './index'
import test from '../share/test'

test('data-grid', (container) => {
  it('basic', function () {
    const dataGrid = new DataGrid(container)
    dataGrid.destroy()
  })
})
