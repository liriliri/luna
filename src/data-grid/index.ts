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
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'

interface IColumn {
  id: string
  title: string
  weight?: number
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
  private $colgroup: $.$
  private resizeSensor: ResizeSensor
  private onResize: () => void
  private tableBody: HTMLElement
  private nodes: DataGridNode[] = []
  private columnWidthsInitialized = false
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' })

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this.updateWeights(), 16)

    this.initOptions(options)

    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')
    this.$tableBody = this.find('.data').find('tbody')
    this.tableBody = this.$tableBody.get(0) as HTMLElement
    this.$colgroup = this.$container.find('colgroup')

    this.renderHeader()
    this.updateWeights()

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  append(data: types.PlainObj<string | HTMLElement>) {
    const node = new DataGridNode(this, data)
    this.tableBody.appendChild(node.container)
    this.nodes.push(node)
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
  }
  private updateWeights() {
    const { container, $headerRow } = this
    const { columns } = this.options

    const tableWidth = container.offsetWidth
    if (!this.columnWidthsInitialized && tableWidth) {
      for (let i = 0, len = columns.length; i < len; i++) {
        const column = columns[i]
        if (!column.weight) {
          const thWidth = ($headerRow.find('th').get(i) as HTMLElement)
            .offsetWidth
          column.weight = (100 * thWidth) / tableWidth
        }
      }

      this.columnWidthsInitialized = true
    }

    this.applyColumnWeights()
  }
  private applyColumnWeights() {
    const { container, $colgroup } = this
    const { columns } = this.options

    const tableWidth = container.offsetWidth
    if (tableWidth <= 0) {
      return
    }

    let sumOfWeights = 0
    const len = columns.length
    for (let i = 0; i < len; i++) {
      sumOfWeights += columns[i].weight as number
    }

    const minColumnWidth = 14
    let html = ''

    let sum = 0
    let lastOffset = 0
    for (let i = 0; i < len; i++) {
      const column = columns[i]
      sum += column.weight as number
      const offset = ((sum * tableWidth) / sumOfWeights) | 0
      const width = Math.max(offset - lastOffset, minColumnWidth)
      lastOffset = offset
      html += `<col style="width:${width}px"></col>`
    }

    $colgroup.html(html)
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
            <colgroup></colgroup>
            <tbody>
              <tr></tr>
            </tbody>
          </table>
        </div>
        <div class="data-container">
          <table class="data">
            <colgroup></colgroup>
            <tbody></tbody>
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
