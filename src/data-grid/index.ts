import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import map from 'licia/map'
import escape from 'licia/escape'
import types from 'licia/types'
import h from 'licia/h'
import toStr from 'licia/toStr'
import isEl from 'licia/isEl'
import isUndef from 'licia/isUndef'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import defaults from 'licia/defaults'
import naturalSort from 'licia/naturalSort'
import isNull from 'licia/isNull'
import isFn from 'licia/isFn'
import isRegExp from 'licia/isRegExp'
import isArr from 'licia/isArr'
import isStr from 'licia/isStr'
import trim from 'licia/trim'
import contain from 'licia/contain'
import toNum from 'licia/toNum'
import lowerCase from 'licia/lowerCase'
import clamp from 'licia/clamp'
import max from 'licia/max'
import min from 'licia/min'
import isOdd from 'licia/isOdd'
import now from 'licia/now'
import remove from 'licia/remove'
import pointerEvent from 'licia/pointerEvent'
import { exportCjs, eventClient, pxToNum } from '../share/util'
import isHidden from 'licia/isHidden'
import filter from 'licia/filter'
import toBool from 'licia/toBool'
import LunaMenu from 'luna-menu'
import randomId from 'licia/randomId'

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
  /** Is column initially visible. */
  visible?: boolean
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
  /** Default selectable for all nodes. */
  selectable?: boolean
  /** Whether to show context menu on header. */
  headerContextMenu?: boolean
}

type NodeData = types.PlainObj<string | HTMLElement>

/** IDataGridNodeOptions */
export interface IDataGridNodeOptions {
  /** Whether the node is selectable. */
  selectable?: boolean
}

const ROW_HEIGHT = 20

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
  private id = `luna-data-grid-${randomId(6, 'abcdefghijklmnopqrstuvwxyz')}`
  private $headerRow: $.$
  private $fillerRow: $.$
  private fillerRow: HTMLElement
  private $tableBody: $.$
  private $colgroup: $.$
  private $dataContainer: $.$
  private $style: $.$
  private dataContainer: HTMLDivElement
  private $resizers: $.$
  private resizeIdx = 0
  private resizeRightIdx = 0
  private resizeStartX = 0
  private resizeStartLeft = 0
  private resizeDeltaX = 0
  private resizeSensor: ResizeSensor
  private onResize: () => void
  private tableBody: HTMLElement
  private nodes: DataGridNode[] = []
  private displayNodes: DataGridNode[] = []
  private colWidthsInitialized = false
  private colMap: types.PlainObj<IColumn> = {}
  private sortId?: string
  private selectedNode: DataGridNode | null = null
  private isAscending = true
  private sorted = false
  private colWidths: number[] = []
  private $space: $.$
  private $data: $.$
  private data: HTMLElement
  private space: HTMLElement
  private spaceHeight = 0
  private topSpaceHeight = 0
  private lastScrollTop = 0
  private lastTimestamp = 0
  private speedToleranceFactor = 100
  private maxSpeedTolerance = 2000
  private minSpeedTolerance = 100
  private scrollTimer: NodeJS.Timeout | null = null
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'data-grid' }, options)
    this.$container.attr({
      tabindex: '0',
      id: this.id,
    })

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      this.updateHeight()
      this.updateWeights()
      this.renderData()
    }, 16)

    if (options.height) {
      options.maxHeight = options.height
      options.minHeight = options.height
    }
    this.initOptions(options, {
      minHeight: 41,
      maxHeight: Infinity,
      filter: '',
      selectable: false,
      headerContextMenu: false,
    })
    const { columns, minHeight, maxHeight } = this.options
    each(columns, (column) => {
      defaults(column, {
        sortable: false,
        visible: true,
      })
      this.colMap[column.id] = column
    })
    if (maxHeight < minHeight) {
      this.setOption('maxHeight', minHeight)
    }
    this.initTpl()
    this.$headerRow = this.find('.header').find('tr')
    this.$fillerRow = this.find('.filler-row')
    this.fillerRow = this.$fillerRow.get(0) as HTMLElement
    this.$data = this.find('.data')
    this.data = this.$data.get(0) as HTMLElement
    this.$tableBody = this.$data.find('tbody')
    this.tableBody = this.$tableBody.get(0) as HTMLElement
    this.$colgroup = this.$container.find('colgroup')
    this.$dataContainer = this.find('.data-container')
    this.dataContainer = this.$dataContainer.get(0) as HTMLDivElement
    this.$space = this.find('.data-space')
    this.space = this.$space.get(0) as HTMLElement
    this.$style = this.$container.find('style')

    this.renderHeader()
    this.renderResizers()
    this.initWeights()
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
    const { nodes, displayNodes } = this
    remove(nodes, (n) => n === node)
    remove(displayNodes, (n) => n === node)
    if (node === this.selectedNode) {
      this.selectNode(null)
    }
    this.renderData()
    this.updateHeight()
  }
  /** Append row data. */
  append(data: NodeData, options: IDataGridNodeOptions = {}) {
    defaults(options, {
      selectable: this.options.selectable,
    })
    const node = new DataGridNode(this, data, options)
    this.nodes.push(node)

    const isVisible = this.filterNode(node)
    if (isVisible) {
      this.displayNodes.push(node)
    }

    if (this.sortId || isVisible) {
      if (this.sortId) {
        this.sorted = false
      }
      this.renderData()
    }

    this.updateHeight()

    return node
  }
  /** Set data. */
  setData(
    data: Array<NodeData | [NodeData, IDataGridNodeOptions]>,
    uniqueId?: string
  ) {
    const items = map(data, (item) => {
      if (!isArr(item)) {
        return [
          item,
          {
            selectable: this.options.selectable,
          },
        ]
      }

      defaults(item[1], {
        selectable: this.options.selectable,
      })

      return item
    }) as Array<[NodeData, IDataGridNodeOptions]>

    if (!uniqueId) {
      this.clearData()
      each(items, (item) => {
        const node = new DataGridNode(this, item[0], item[1])
        this.nodes.push(node)
        if (this.filterNode(node)) {
          this.displayNodes.push(node)
        }
      })
    } else {
      const nodesMap: types.PlainObj<DataGridNode> = {}
      each(this.nodes, (node) => {
        nodesMap[node.data[uniqueId] as string] = node
      })
      const nodes: Array<DataGridNode> = []
      const displayNodes: Array<DataGridNode> = []

      each(items, (item) => {
        const id = item[0][uniqueId] as string
        let node
        if (nodesMap[id]) {
          node = nodesMap[id]
          node.data = item[0]
          node.render()
        } else {
          node = new DataGridNode(this, item[0], item[1])
        }
        nodes.push(node)
        if (this.filterNode(node)) {
          displayNodes.push(node)
        }
      })

      if (this.selectedNode && !contain(nodes, this.selectedNode)) {
        this.selectNode(null)
      }

      this.nodes = nodes
      this.displayNodes = displayNodes
    }

    if (this.sortId) {
      this.sorted = false
    }

    this.renderData()
    this.updateHeight()
  }
  /** Clear all data. */
  clear() {
    this.clearData()
    this.renderData()
    this.updateHeight()
  }
  /** Fit height to the containing element. */
  fit() {
    if (isHidden(this.container)) {
      return
    }
    const parent = this.$container.parent().get(0) as HTMLElement
    const style = window.getComputedStyle(parent)
    const clientHeight = parent.clientHeight
    const paddingTop = pxToNum(style.paddingTop)
    const paddingBottom = pxToNum(style.paddingBottom)
    const height = clientHeight - paddingTop - paddingBottom
    this.setOption({
      minHeight: height,
      maxHeight: height,
    })
  }
  private clearData() {
    this.nodes = []
    this.displayNodes = []
    this.selectNode(null)
  }
  private updateHeight() {
    const { $fillerRow, $container } = this
    let { maxHeight, minHeight } = this.options

    const headerHeight = this.$headerRow.offset().height
    const borderTopWidth = pxToNum($container.css('border-top-width'))
    const borderBottomWidth = pxToNum($container.css('border-bottom-width'))
    const minusHeight = headerHeight + borderTopWidth + borderBottomWidth

    minHeight -= minusHeight
    if (minHeight < 0) {
      minHeight = 0
    }
    maxHeight -= minusHeight

    const len = this.displayNodes.length
    let height = 0
    if (len > 0) {
      height = ROW_HEIGHT * len
    }

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

    if (this.selectedNode === node) {
      return
    }

    if (this.selectedNode) {
      this.selectedNode.deselect()
      this.selectedNode = null
      if (isNull(node)) {
        this.emit('deselect')
      }
    }
    if (!isNull(node)) {
      this.selectedNode = node
      node.select()
      this.emit('select', node)
    }
  }
  private getRightIdx(leftIdx: number) {
    const { columns } = this.options
    const displayColumns = filter(columns, (col) => toBool(col.visible))
    const leftCol = columns[leftIdx]
    for (let i = 0, len = displayColumns.length; i < len; i++) {
      if (displayColumns[i] === leftCol) {
        return columns.indexOf(displayColumns[i + 1])
      }
    }

    return -1
  }
  private onResizeColStart(e: any) {
    const { c, resizeIdx, $resizers } = this

    e.stopPropagation()
    e.preventDefault()
    e = e.origEvent
    this.resizeStartX = eventClient('x', e)
    this.resizeStartLeft = pxToNum($resizers.eq(resizeIdx).css('left'))

    $(document.body).addClass(c('resizing'))
    $document.on(pointerEvent('move'), this.onResizeColMove)
    $document.on(pointerEvent('up'), this.onResizeColEnd)
  }
  private onResizeColMove = (e: any) => {
    const { resizeIdx, resizeRightIdx, $resizers, colWidths, $colgroup } = this
    e = e.origEvent

    let deltaX = eventClient('x', e) - this.resizeStartX
    const leftColWidth = colWidths[resizeIdx]
    const rightColWidth = colWidths[resizeRightIdx]
    const lowerBound = min(-leftColWidth + MIN_COL_WIDTH, 0)
    const upperBound = max(rightColWidth - MIN_COL_WIDTH, 0)
    deltaX = clamp(deltaX, lowerBound, upperBound)
    $colgroup.each(function (this: HTMLTableColElement) {
      const $cols = $(this).find('col')
      $cols.eq(resizeIdx).css('width', leftColWidth + deltaX + 'px')
      $cols.eq(resizeRightIdx).css('width', rightColWidth - deltaX + 'px')
    })
    this.resizeDeltaX = deltaX
    const newLeft = this.resizeStartLeft + deltaX

    $resizers.eq(resizeIdx).css('left', `${newLeft}px`)
  }
  private onResizeColEnd = (e: any) => {
    this.onResizeColMove(e)

    const { c, colWidths, resizeIdx, resizeRightIdx, resizeDeltaX } = this
    const { columns } = this.options
    const leftCol = columns[resizeIdx]
    const rightCol = columns[resizeRightIdx]

    const leftColWidth = colWidths[resizeIdx] + resizeDeltaX
    const rightColWidth = colWidths[resizeRightIdx] - resizeDeltaX
    const totalWidth = leftColWidth + rightColWidth
    const totalWeight = (leftCol.weight as number) + (rightCol.weight as number)
    const leftWeight = totalWeight * (leftColWidth / totalWidth)
    const rightWeight = totalWeight - leftWeight
    leftCol.weight = leftWeight
    rightCol.weight = rightWeight
    this.updateWeights()

    $(document.body).rmClass(c('resizing'))
    $document.off(pointerEvent('move'), this.onResizeColMove)
    $document.off(pointerEvent('up'), this.onResizeColEnd)
  }
  private bindEvent() {
    const { c, $headerRow, $tableBody, $resizers, $dataContainer } = this

    this.resizeSensor.addListener(this.onResize)

    $dataContainer.on('scroll', this.onScroll)

    const self = this

    $tableBody
      .on('click', c('.node'), function (this: any, e: any) {
        self.selectNode(this.dataGridNode)
        setTimeout(() => {
          if (this.hasDoubleClick) {
            return
          }
          self.emit('click', e.origEvent, this.dataGridNode)
        }, 200)
      })
      .on('dblclick', c('.node'), function (this: any, e: any) {
        e.stopPropagation()
        this.hasDoubleClick = true
        self.emit('dblclick', e.origEvent, this.dataGridNode)
        setTimeout(() => {
          this.hasDoubleClick = false
        }, 300)
      })
      .on('contextmenu', c('.node'), function (this: any, e: any) {
        e.preventDefault()
        e.stopPropagation()
        self.selectNode(this.dataGridNode)
        self.emit('contextmenu', e.origEvent, this.dataGridNode)
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

        $headerRow.find(c('.icon-caret-up')).hide()
        $headerRow.find(c('.icon-caret-down')).hide()

        const $iconUp = $this.find(c('.icon-caret-up'))
        const $iconDown = $this.find(c('.icon-caret-down'))
        if (isAscending) {
          $iconUp.show()
        } else {
          $iconDown.show()
        }

        self.sortNodes(id, isAscending)
        self.renderData()

        $headerRow.find('th').each(function (this: HTMLTableCellElement) {
          const $this = $(this)
          if ($this.data('id') !== id) {
            $this.rmAttr('data-order')
          }
        })
      }
    )

    $headerRow.on('contextmenu', (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (!this.options.headerContextMenu) {
        return
      }
      e = e.origEvent
      const { columns } = this.options
      let visibleCount = 0
      each(columns, (column) => {
        if (toBool(column.visible)) {
          visibleCount++
        }
      })
      const menu = LunaMenu.build(
        map(columns, (column) => {
          const visible = toBool(column.visible)
          return {
            label: column.title,
            checked: visible,
            enabled: !visible || visibleCount > 1,
            click() {
              column.visible = !visible
              self.renderHeader()
              self.updateWeights()
            },
          }
        })
      )
      menu.show(eventClient('x', e), eventClient('y', e))
    })

    $resizers.on(pointerEvent('down'), function (this: HTMLDivElement, e) {
      const $this = $(this)
      self.resizeIdx = toNum($this.data('idx'))
      self.resizeRightIdx = self.getRightIdx(self.resizeIdx)
      self.onResizeColStart(e)
    })

    this.on('changeOption', (name) => {
      switch (name) {
        case 'minHeight':
        case 'maxHeight':
          this.updateHeight()
          break
        case 'filter':
          this.displayNodes = []
          each(this.nodes, (node) => {
            if (this.filterNode(node)) {
              this.displayNodes.push(node)
            }
          })
          if (this.selectedNode && !this.filterNode(this.selectedNode)) {
            this.selectNode(null)
          }
          this.renderData()
          this.updateHeight()
          break
      }
    })
  }
  private sortNodes(id: string, isAscending: boolean) {
    const column = this.colMap[id]

    const comparator = column.comparator || naturalSort.comparator
    function sortFn(a: DataGridNode, b: DataGridNode) {
      let aVal = a.data[id]
      let bVal = b.data[id]
      if (isEl(aVal)) {
        aVal = (aVal as HTMLElement).innerText
      }
      if (isEl(bVal)) {
        bVal = (bVal as HTMLElement).innerText
      }

      return isAscending ? comparator(aVal, bVal) : comparator(bVal, aVal)
    }
    this.nodes.sort(sortFn)
    this.displayNodes.sort(sortFn)

    this.sorted = true
    this.sortId = id
    this.isAscending = isAscending
  }
  private initWeights() {
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

    this.updateWeights()
  }
  private updateWeights() {
    const { container, $colgroup } = this
    const { columns } = this.options

    const tableWidth = container.offsetWidth
    if (tableWidth <= 0) {
      return
    }

    let sumOfWeights = 0
    const len = columns.length
    for (let i = 0; i < len; i++) {
      if (columns[i].visible) {
        sumOfWeights += columns[i].weight as number
      }
    }

    let html = ''

    let sum = 0
    let lastOffset = 0
    this.colWidths = []
    for (let i = 0; i < len; i++) {
      const column = columns[i]
      if (column.visible) {
        sum += column.weight as number
        let offset = ((sum * tableWidth) / sumOfWeights) | 0
        let width = offset - lastOffset
        if (width < MIN_COL_WIDTH) {
          width = MIN_COL_WIDTH
          offset = lastOffset + width
        }
        lastOffset = offset
        html += `<col style="width:${width}px"></col>`
        this.colWidths[i] = width
      } else {
        html += `<col style="width:0;display:none"></col>`
        this.colWidths[i] = 0
      }
    }

    $colgroup.html(html)

    this.positionResizers()
  }
  private positionResizers() {
    const { colWidths } = this
    const { columns } = this.options
    const resizerLeft: number[] = []
    const len = colWidths.length - 1
    for (let i = 0; i < len; i++) {
      resizerLeft[i] = (resizerLeft[i - 1] || 0) + colWidths[i]
    }
    for (let i = 0; i < len; i++) {
      const $resizer = this.$resizers.eq(i)
      if (!columns[i].visible) {
        $resizer.hide()
      } else {
        $resizer.show()
        $resizer.css('left', resizerLeft[i] + 'px')
      }
    }
  }
  private onScroll = () => {
    const { scrollHeight, clientHeight, scrollTop } = this
      .dataContainer as HTMLElement
    // safari bounce effect
    if (scrollTop <= 0) return
    if (clientHeight + scrollTop > scrollHeight) return

    const lastScrollTop = this.lastScrollTop
    const lastTimestamp = this.lastTimestamp

    const timestamp = now()
    const duration = timestamp - lastTimestamp
    const distance = scrollTop - lastScrollTop
    const speed = Math.abs(distance / duration)
    let speedTolerance = speed * this.speedToleranceFactor
    if (duration > 1000) {
      speedTolerance = 1000
    }
    if (speedTolerance > this.maxSpeedTolerance) {
      speedTolerance = this.maxSpeedTolerance
    }
    if (speedTolerance < this.minSpeedTolerance) {
      speedTolerance = this.minSpeedTolerance
    }
    this.lastScrollTop = scrollTop
    this.lastTimestamp = timestamp

    let topTolerance = 0
    let bottomTolerance = 0
    if (lastScrollTop < scrollTop) {
      topTolerance = this.minSpeedTolerance
      bottomTolerance = speedTolerance
    } else {
      topTolerance = speedTolerance
      bottomTolerance = this.minSpeedTolerance
    }

    if (
      this.topSpaceHeight < scrollTop - topTolerance &&
      this.topSpaceHeight + this.data.offsetHeight >
        scrollTop + clientHeight + bottomTolerance
    ) {
      return
    }

    this.renderData({
      topTolerance: topTolerance * 2,
      bottomTolerance: bottomTolerance * 2,
    })

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    this.scrollTimer = setTimeout(() => {
      this.renderData()
    }, 100)
  }
  private renderData = throttle(
    ({ topTolerance = 500, bottomTolerance = 500 } = {}) => {
      if (this.sortId && !this.sorted) {
        this.sortNodes(this.sortId, this.isAscending)
      }

      const { dataContainer, displayNodes, tableBody } = this
      const { scrollTop, clientHeight } = dataContainer
      const top = scrollTop - topTolerance
      const bottom = scrollTop + clientHeight + bottomTolerance

      let topSpaceHeight = 0
      let currentHeight = 0

      const len = displayNodes.length

      const renderNodes = []
      const height = ROW_HEIGHT

      for (let i = 0; i < len; i++) {
        const node = displayNodes[i]

        if (currentHeight <= bottom) {
          if (currentHeight + height > top) {
            if (renderNodes.length === 0 && isOdd(i)) {
              renderNodes.push(displayNodes[i - 1])
              topSpaceHeight -= height
            }
            renderNodes.push(node)
          } else if (currentHeight < top) {
            topSpaceHeight += height
          }
        }

        currentHeight += height
      }

      this.updateSpace(currentHeight)
      this.updateTopSpace(topSpaceHeight)

      const frag = document.createDocumentFragment()
      for (let i = 0, len = renderNodes.length; i < len; i++) {
        frag.appendChild(renderNodes[i].container)
      }
      frag.appendChild(this.fillerRow)

      tableBody.textContent = ''
      tableBody.appendChild(frag)
    },
    16
  )
  private updateTopSpace(height: number) {
    this.topSpaceHeight = height
    this.data.style.top = height + 'px'
  }
  private updateSpace(height: number) {
    if (this.spaceHeight === height) {
      return
    }
    this.spaceHeight = height
    this.space.style.height = height + 'px'
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
    let style = ''
    let fillerRowHtml = ''
    let firstVisible = true
    each(this.options.columns, (column, idx) => {
      const title = escape(column.title)
      if (column.sortable) {
        html += c(`
          <th class="sortable" data-id="${column.id}">
            ${title}
            <span class="icon-caret-up"></span>
            <span class="icon-caret-down"></span>
          </th>`)
      } else {
        html += `<th>${title}</th>`
      }
      fillerRowHtml += '<td></td>'
      const nth = idx + 1

      const declarations = `${column.visible ? '' : 'display:none;'}${
        column.visible && firstVisible ? 'border-left:none;' : ''
      }`
      if (declarations) {
        style += `#${this.id} th:nth-child(${nth}), #${this.id} td:nth-child(${nth}) { ${declarations} }\n`
      }
      if (column.visible && firstVisible) {
        firstVisible = false
      }
    })

    this.$headerRow.html(html)
    this.$fillerRow.html(fillerRowHtml)
    this.$style.text(style)
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
        <style type="text/css"></style>
        <div class="header-container">
          <table class="header">
            <colgroup></colgroup>
            <tbody>
              <tr></tr>
            </tbody>
          </table>
        </div>
        <div class="data-container">
          <div class="data-space">
            <table class="data">
              <colgroup></colgroup>
              <tbody>
                <tr class="filler-row"></tr>
              </tbody>
            </table>
          </div>
        </div>
      `)
    )
  }
}

export class DataGridNode {
  container: HTMLElement = h('tr')
  data: types.PlainObj<string | HTMLElement>
  selectable = false
  private $container: $.$
  private dataGrid: DataGrid
  constructor(
    dataGrid: DataGrid,
    data: types.PlainObj<string | HTMLElement>,
    options: IDataGridNodeOptions
  ) {
    ;(this.container as any).dataGridNode = this
    this.$container = $(this.container)
    this.$container.addClass(dataGrid.c('node'))

    this.dataGrid = dataGrid
    this.data = data
    if (options.selectable) {
      this.selectable = options.selectable
      this.$container.addClass(dataGrid.c('selectable'))
    }

    this.render()
  }
  text() {
    return this.$container.text()
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

if (typeof module !== 'undefined') {
  exportCjs(module, DataGrid)
}
