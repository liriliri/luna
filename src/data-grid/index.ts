import Component from '../share/Component'

export default class DataGrid extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'data-grid' })
  }
}

module.exports = DataGrid
module.exports.default = DataGrid
