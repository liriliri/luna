import DataGrid from './index'
import test from '../share/test'

test('data-grid', (container) => {
  it('basic', function () {
    const dataGrid = new DataGrid(container, {
      columns: [
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
      ],
    })
    dataGrid.append({
      index: 0,
      name: 'Taobao',
      site: 'www.taobao.com',
    })
  })
})
