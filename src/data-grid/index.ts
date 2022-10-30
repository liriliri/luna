import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import escape from 'licia/escape'
import types from 'licia/types'
import h from 'licia/h'
import toStr from 'licia/toStr'
import isEl from 'licia/isEl'
import isUndef from 'licia/isUndef'

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
  private $tableBody: $.$
  private tableBody: HTMLElement
  private nodes: DataGridNode[] = []
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' })

    this.initOptions(options)

    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')
    this.$tableBody = this.find('.data').find('tbody')
    this.tableBody = this.$tableBody.get(0) as HTMLElement

    this.renderHeader()
  }
  append(data: types.PlainObj<string | HTMLElement>) {
    console.log('lalala')
    const node = new DataGridNode(this, data)
    this.tableBody.appendChild(node.container)
    this.nodes.push(node)
  }
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
            <tbody>
            </tbody>
          </table>
        </div>
      `)
    )
  }
}

class DataGridNode {
  container: HTMLElement = h('tr')
  private $container: $.$
  private dataGrid: DataGrid
  private data: types.PlainObj<string | HTMLElement>
  constructor(dataGrid: DataGrid, data: types.PlainObj<string | HTMLElement>) {
    this.$container = $(this.container)

    this.dataGrid = dataGrid
    this.data = data

    this.render()
  }
  render() {
    const { data, $container, container } = this
    const columns = this.dataGrid.getOption('columns') as IColumn[]

    $container.html('')
    each(columns, (column) => {
      const td = h('td')
      const val = data[column.id]
      if (!isUndef(val)) {
        if (isEl(val)) {
          td.appendChild(val as HTMLElement)
        } else {
          td.innerText = toStr(val)
        }
      }
      container.appendChild(td)
    })
  }
}

module.exports = DataGrid
module.exports.default = DataGrid
