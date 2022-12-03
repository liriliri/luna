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
import defaults from 'licia/defaults'
import startWith from 'licia/startWith'

/** IColumn */
export interface IColumn {
  /** Column id. */
  id: string
  /** Column display name. */
  title: string
  /** Column weight. */
  weight?: number
  /** Is column sortable. */
  sortable?: boolean
  /** Column sort comparator if sortable is true. */
  comparator?: types.AnyFn
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Table columns. */
  columns: IColumn[]
  /** Table height. */
  height?: number
  /** Max table height. */
  maxHeight?: number
  /** Min table height. */
  minHeight?: number
}

/**
 * Grid for displaying datasets.
 *
 * @example
 * const dataGrid = new DataGrid(container, {
 *   columns: [
 *     {
 *       id: 'name',
 *       title: 'Name',
 *       sortable: true,
 *     },
 *     {
 *        id: 'site',
 *        title: 'Site',
 *      },
 *   ],
 * })
 *
 * dataGrid.append({
 *   name: 'Runoob',
 *   site: 'www.runoob.com',
 * })
 */
export default class DataGrid extends Component<IOptions> {
  private $headerRow: $.$
  private $fillerRow: $.$
  private fillerRow: HTMLElement
  private $tableBody: $.$
  private $colgroup: $.$
  private $dataContainer: $.$
  private resizeSensor: ResizeSensor
  private onResize: () => void
  private tableBody: HTMLElement
  private nodes: DataGridNode[] = []
  private columnWidthsInitialized = false
  private columnMap: types.PlainObj<IColumn> = {}
  private sortId?: string
  private isAscending = true
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' }, options)

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      this.updateHeight()
      this.updateWeights()
    }, 16)

    if (options.height) {
      options.maxHeight = options.height
      options.minHeight = options.height
    }
    this.initOptions(options, {
      minHeight: 41,
      maxHeight: Infinity,
    })
    const { columns, minHeight, maxHeight } = this.options
    each(columns, (column) => {
      defaults(column, {
        sortable: false,
      })
      this.columnMap[column.id] = column
    })
    if (maxHeight < minHeight) {
      this.setOption('maxHeight', minHeight)
    }

    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')
    this.$fillerRow = this.find('.filler-row')
    this.fillerRow = this.$fillerRow.get(0) as HTMLElement
    this.$tableBody = this.find('.data').find('tbody')
    this.tableBody = this.$tableBody.get(0) as HTMLElement
    this.$colgroup = this.$container.find('colgroup')
    this.$dataContainer = this.find('.data-container')

    this.renderHeader()
    this.updateWeights()
    this.updateHeight()

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  /** Append row data. */
  append(data: types.PlainObj<string | HTMLElement>) {
    const node = new DataGridNode(this, data)
    this.nodes.push(node)

    if (this.sortId) {
      this.sortNodes(this.sortId, this.isAscending)
    } else {
      this.tableBody.insertBefore(node.container, this.fillerRow)
      this.updateHeight()
    }

    return node
  }
  /** Clear all data. */
  clear() {
    each(this.nodes, (node) => node.detach())
    this.nodes = []

    this.updateHeight()
  }
  private updateHeight() {
    const { $fillerRow } = this
    let { maxHeight, minHeight } = this.options

    this.$dataContainer.css({ height: 'auto' })

    minHeight -= 23
    if (minHeight < 0) {
      minHeight = 0
    }
    maxHeight -= 23

    let height = this.nodes.length * 20

    if (height > minHeight) {
      $fillerRow.hide()
    } else {
      $fillerRow.show()
    }

    if (height < minHeight) {
      height = minHeight
    } else if (height >= maxHeight) {
      height = maxHeight
    }

    this.$dataContainer.css({ height })
  }
  private bindEvent() {
    const { c, $headerRow } = this

    this.resizeSensor.addListener(this.onResize)

    const self = this
    $headerRow.on(
      'click',
      c('.sortable'),
      function (this: HTMLTableCellElement, e) {
        e.stopPropagation()

        const $this = $(this)
        const id = $this.data('id')
        const order = $this.data('order')
        const isAscending = order !== 'descending'
        $this.data('order', isAscending ? 'descending' : 'ascending')

        self.sortNodes(id, isAscending)

        $headerRow.find('th').each(function (this: HTMLTableCellElement) {
          const $this = $(this)
          if ($this.data('id') !== id) {
            $this.rmAttr('data-order')
          }
        })
      }
    )

    this.on('optionChange', (name) => {
      switch (name) {
        case 'minHeight':
        case 'maxHeight':
          this.updateHeight()
          break
      }
    })
  }
  private sortNodes(id: string, isAscending: boolean) {
    const column = this.columnMap[id]

    const comparator = column.comparator || naturalOrderComparator
    this.nodes.sort(function (a, b) {
      let aVal = a.data[id]
      let bVal = b.data[id]
      if (isEl(aVal)) {
        aVal = (aVal as HTMLElement).innerText
      }
      if (isEl(bVal)) {
        bVal = (bVal as HTMLElement).innerText
      }

      return isAscending ? comparator(aVal, bVal) : comparator(bVal, aVal)
    })

    this.renderData()

    this.sortId = id
    this.isAscending = isAscending
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
  private renderData() {
    const { tableBody, nodes, fillerRow } = this

    each(nodes, (node) => node.detach())
    each(nodes, (node) => {
      tableBody.insertBefore(node.container, fillerRow)
    })

    this.updateHeight()
  }
  private renderHeader() {
    const { c } = this
    let html = ''
    let fillerRowHtml = ''
    each(this.options.columns, (column) => {
      const title = escape(column.title)
      if (column.sortable) {
        html += c(`<th class="sortable" data-id="${column.id}">${title}</th>`)
      } else {
        html += `<th>${title}</th>`
      }
      fillerRowHtml += '<td></td>'
    })

    this.$headerRow.html(html)
    this.$fillerRow.html(fillerRowHtml)
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
            <tbody>
              <tr class="filler-row"></tr>
            </tbody>
          </table>
        </div>
      `)
    )
  }
}

class DataGridNode {
  container: HTMLElement = h('tr')
  data: types.PlainObj<string | HTMLElement>
  private $container: $.$
  private dataGrid: DataGrid
  constructor(dataGrid: DataGrid, data: types.PlainObj<string | HTMLElement>) {
    this.$container = $(this.container)

    this.dataGrid = dataGrid
    this.data = data

    this.render()
  }
  detach() {
    this.$container.remove()
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

function naturalOrderComparator(a: any, b: any) {
  a = toStr(a)
  b = toStr(b)
  if (startWith(a, '_') && !startWith(b, '_')) {
    return 1
  }
  if (startWith(b, '_') && !startWith(a, '_')) {
    return -1
  }

  const chunk = /^\d+|^\D+/
  let chunka, chunkb, anum, bnum
  /* eslint-disable no-constant-condition */
  while (true) {
    if (a) {
      if (!b) {
        return 1
      }
    } else {
      if (b) {
        return -1
      }
      return 0
    }
    chunka = a.match(chunk)[0]
    chunkb = b.match(chunk)[0]
    anum = !isNaN(chunka)
    bnum = !isNaN(chunkb)
    if (anum && !bnum) {
      return -1
    }
    if (bnum && !anum) {
      return 1
    }
    if (anum && bnum) {
      const diff = chunka - chunkb
      if (diff) {
        return diff
      }
      if (chunka.length !== chunkb.length) {
        if (!+chunka && !+chunkb) {
          return chunka.length - chunkb.length
        }
        return chunkb.length - chunka.length
      }
    } else if (chunka !== chunkb) {
      return chunka < chunkb ? -1 : 1
    }
    a = a.substring(chunka.length)
    b = b.substring(chunkb.length)
  }
}

module.exports = DataGrid
module.exports.default = DataGrid
