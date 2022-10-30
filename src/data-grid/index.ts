import extend from 'licia/extend'
import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import DataGridNode from './DataGridNode'
import each from 'licia/each'
import escape from 'licia/escape'

interface IColumn {
  id: string
  title: string
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  columns: IColumn[]
}

/**
 * Grid for displaying datasets.
 */
export default class DataGrid extends Component<IOptions> {
  private $headerRow: $.$
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' })

    this.initOptions(options)

    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')

    this.renderHeader()
  }
  insert(node: DataGridNode) {}
  private renderHeader() {
    let html = ''
    each(this.options.columns, (column) => {
      html += `<th>${escape(column.title)}</th>`
    })

    this.$headerRow.html(html)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="header-container">
          <table class="header">
            <tr></tr>
          </table>
        </div>
        <div class="data-container">
          <table class="data">
          </table>
        </div>
      `)
    )
  }
}

export { DataGridNode }

module.exports = extend(DataGrid, exports)
module.exports.default = DataGrid
