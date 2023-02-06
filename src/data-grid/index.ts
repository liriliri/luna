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
import isNull from 'licia/isNull'
import isFn from 'licia/isFn'
import isRegExp from 'licia/isRegExp'
import isStr from 'licia/isStr'
import trim from 'licia/trim'
import contain from 'licia/contain'
import toNum from 'licia/toNum'
import lowerCase from 'licia/lowerCase'
import clamp from 'licia/clamp'
import max from 'licia/max'
import min from 'licia/min'
import { exportCjs, drag, eventClient, pxToNum } from '../share/util'

const $document = $(document as any)
const MIN_COL_WIDTH = 24

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
  /** Data filter. */
  filter?: string | RegExp | types.AnyFn
}

/** IDataGridNodeOptions */
export interface IDataGridNodeOptions {
  /** Whether the node is selectable. */
  selectable?: boolean
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
  private $resizers: $.$
  private resizeIdx = 0
  private resizeStartX = 0
  private resizeStartLeft = 0
  private resizeDeltaX = 0
  private resizeSensor: ResizeSensor
  private onResize: () => void
  private tableBody: HTMLElement
  private nodes: DataGridNode[] = []
  private colWidthsInitialized = false
  private colMap: types.PlainObj<IColumn> = {}
  private sortId?: string
  private selectedNode: DataGridNode | null = null
  private isAscending = true
  private colWidths: number[] = []
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' }, options)
    this.$container.attr('tabindex', '0')

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
      filter: '',
    })
    const { columns, minHeight, maxHeight } = this.options
    each(columns, (column) => {
      defaults(column, {
        sortable: false,
      })
      this.colMap[column.id] = column
    })
    if (maxHeight < minHeight) {
      this.setOption('maxHeight', minHeight)
    }
    ;('width')
    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')
    this.$fillerRow = this.find('.filler-row')
    this.fillerRow = this.$fillerRow.get(0) as HTMLElement
    this.$tableBody = this.find('.data').find('tbody')
    this.tableBody = this.$tableBody.get(0) as HTMLElement
    this.$colgroup = this.$container.find('colgroup')
    this.$dataContainer = this.find('.data-container')

    this.renderHeader()
    this.renderResizers()
    this.updateWeights()
    this.updateHeight()

    this.bindEvent()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
    this.$container.rmAttr('tabindex')
  }
  /** Remove row data. */
  remove(node: DataGridNode) {
    const { nodes } = this
    const pos = nodes.indexOf(node)
    if (pos > -1) {
      node.detach()
      nodes.splice(pos, 1)
      if (node === this.selectedNode) {
        this.selectNode(nodes[pos] || nodes[pos - 1] || null)
      }
      this.updateHeight()
    }
  }
  /** Append row data. */
  append(
    data: types.PlainObj<string | HTMLElement>,
    options?: IDataGridNodeOptions
  ) {
    const node = new DataGridNode(this, data, options)
    this.nodes.push(node)

    if (this.sortId) {
      this.sortNodes(this.sortId, this.isAscending)
    } else {
      if (this.filterNode(node)) {
        this.tableBody.insertBefore(node.container, this.fillerRow)
        this.updateHeight()
      }
    }

    return node
  }
  /** Clear all data. */
  clear() {
    each(this.nodes, (node) => node.detach())
    this.nodes = []
    this.selectNode(null)

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

    let height = ((this.$dataContainer.find('tr') as any).length - 1) * 20

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
  private selectNode(node: DataGridNode | null) {
    if (!isNull(node) && !node?.selectable) {
      return
    }
    if (this.selectedNode) {
      this.selectedNode.deselect()
      this.selectedNode = null
    }
    if (!isNull(node)) {
      this.selectedNode = node
      this.selectedNode?.select()
      this.emit('select', node)
    } else {
      this.emit('deselect')
    }
  }
  private onResizeColStart(e: any) {
    const { c, resizeIdx, $resizers } = this

    e.stopPropagation()
    e.preventDefault()
    e = e.origEvent
    this.resizeStartX = eventClient('x', e)
    this.resizeStartLeft = pxToNum($resizers.eq(resizeIdx).css('left'))

    $(document.body).addClass(c('resizing'))
    $document.on(drag('move'), this.onResizeColMove)
    $document.on(drag('end'), this.onResizeColEnd)
  }
  private onResizeColMove = (e: any) => {
    const { resizeIdx, $resizers, colWidths, $colgroup } = this
    e = e.origEvent

    let deltaX = eventClient('x', e) - this.resizeStartX
    const leftColWidth = colWidths[resizeIdx]
    const rightColWidth = colWidths[resizeIdx + 1]
    const lowerBound = min(-leftColWidth + MIN_COL_WIDTH, 0)
    const upperBound = max(rightColWidth - MIN_COL_WIDTH, 0)
    deltaX = clamp(deltaX, lowerBound, upperBound)
    $colgroup.each(function (this: HTMLTableColElement) {
      const $cols = $(this).find('col')
      $cols.eq(resizeIdx).css('width', leftColWidth + deltaX + 'px')
      $cols.eq(resizeIdx + 1).css('width', rightColWidth - deltaX + 'px')
    })
    this.resizeDeltaX = deltaX
    let newLeft = this.resizeStartLeft + deltaX

    $resizers.eq(resizeIdx).css('left', `${newLeft}px`)
  }
  private onResizeColEnd = (e: any) => {
    this.onResizeColMove(e)

    const { c, colWidths, resizeIdx, resizeDeltaX } = this
    const { columns } = this.options
    const leftCol = columns[resizeIdx]
    const rightCol = columns[resizeIdx + 1]

    const leftColWidth = colWidths[resizeIdx] + resizeDeltaX
    const rightColWidth = colWidths[resizeIdx + 1] - resizeDeltaX
    const totalWidth = leftColWidth + rightColWidth
    const totalWeight = (leftCol.weight as number) + (rightCol.weight as number)
    const leftWeight = totalWeight * (leftColWidth / totalWidth)
    const rightWeight = totalWeight - leftWeight
    leftCol.weight = leftWeight
    rightCol.weight = rightWeight
    this.applyColWeights()

    $(document.body).rmClass(c('resizing'))
    $document.off(drag('move'), this.onResizeColMove)
    $document.off(drag('end'), this.onResizeColEnd)
  }
  private bindEvent() {
    const { c, $headerRow, $tableBody, $resizers } = this

    this.resizeSensor.addListener(this.onResize)

    const self = this

    $tableBody.on('click', c('.node'), function (this: any) {
      self.selectNode(this.dataGridNode)
    })

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

    $resizers.on(drag('start'), function (this: HTMLDivElement, e) {
      const $this = $(this)
      self.resizeIdx = toNum($this.data('idx'))
      self.onResizeColStart(e)
    })

    this.on('optionChange', (name) => {
      switch (name) {
        case 'minHeight':
        case 'maxHeight':
          this.updateHeight()
          break
        case 'filter':
          this.renderData()
          break
      }
    })
  }
  private sortNodes(id: string, isAscending: boolean) {
    const column = this.colMap[id]

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
    if (!this.colWidthsInitialized && tableWidth) {
      for (let i = 0, len = columns.length; i < len; i++) {
        const column = columns[i]
        if (!column.weight) {
          const thWidth = ($headerRow.find('th').get(i) as HTMLElement)
            .offsetWidth
          column.weight = (100 * thWidth) / tableWidth
        }
      }

      this.colWidthsInitialized = true
    }

    this.applyColWeights()
  }
  private applyColWeights() {
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
    this.colWidths = []
    for (let i = 0; i < len; i++) {
      const column = columns[i]
      sum += column.weight as number
      const offset = ((sum * tableWidth) / sumOfWeights) | 0
      const width = Math.max(offset - lastOffset, minColumnWidth)
      lastOffset = offset
      html += `<col style="width:${width}px"></col>`
      this.colWidths[i] = width
    }

    $colgroup.html(html)

    this.positionResizers()
  }
  private positionResizers() {
    const { colWidths } = this
    const resizerLeft: number[] = []
    const len = colWidths.length - 1
    for (let i = 0; i < len; i++) {
      resizerLeft[i] = (resizerLeft[i - 1] || 0) + colWidths[i]
    }
    for (let i = 0; i < len; i++) {
      this.$resizers.eq(i).css('left', resizerLeft[i] + 'px')
    }
  }
  private renderData() {
    const { tableBody, nodes, fillerRow } = this

    each(nodes, (node) => node.detach())
    each(nodes, (node) => {
      if (this.filterNode(node)) {
        tableBody.insertBefore(node.container, fillerRow)
      }
    })
    if (this.selectedNode && !this.filterNode(this.selectedNode)) {
      this.selectNode(null)
    }

    this.updateHeight()
  }
  private filterNode(node: DataGridNode) {
    let { filter } = this.options

    if (filter) {
      if (isFn(filter)) {
        return (filter as types.AnyFn)(node)
      } else if (isRegExp(filter)) {
        return (filter as RegExp).test(node.text())
      } else if (isStr(filter)) {
        filter = trim(filter as string)
        if (filter) {
          return contain(lowerCase(node.text()), lowerCase(filter))
        }
      }
    }

    return true
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
  private renderResizers() {
    let resizers = ''
    const len = this.options.columns.length - 1
    for (let i = 0; i < len; i++) {
      resizers += this.c(`<div class="resizer" data-idx="${i}"></div>`)
    }
    this.$container.append(resizers)
    this.$resizers = this.find('.resizer')
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

export class DataGridNode {
  container: HTMLElement = h('tr')
  data: types.PlainObj<string | HTMLElement>
  selectable: boolean = false
  private $container: $.$
  private dataGrid: DataGrid
  constructor(
    dataGrid: DataGrid,
    data: types.PlainObj<string | HTMLElement>,
    options: IDataGridNodeOptions = {
      selectable: false,
    }
  ) {
    ;(this.container as any).dataGridNode = this
    this.$container = $(this.container)
    this.$container.addClass(dataGrid.c('node'))

    this.dataGrid = dataGrid
    this.data = data
    if (options.selectable) {
      this.selectable = options.selectable
    }

    this.render()
  }
  text() {
    return this.$container.text()
  }
  detach() {
    this.$container.remove()
  }
  select() {
    this.$container.addClass(this.dataGrid.c('selected'))
  }
  deselect() {
    this.$container.rmClass(this.dataGrid.c('selected'))
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

if (typeof module !== 'undefined') {
  exportCjs(module, DataGrid)
}
