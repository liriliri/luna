import extend from 'licia/extend'
import Component from '../share/Component'
import DataGridNode from './DataGridNode'

export default class DataGrid extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'data-grid' })
  }
}

export { DataGridNode }

module.exports = extend(DataGrid, exports)
module.exports.default = DataGrid
