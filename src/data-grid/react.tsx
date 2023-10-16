import { FC, useEffect, useRef } from 'react'
import DataGrid, { IColumn, DataGridNode } from './index'
import types from 'licia/types'
import each from 'licia/each'

interface IDataGridProps {
  columns: IColumn[]
  onSelect?: (node: DataGridNode) => void
  onDeselect?: () => void
  className?: string
  data?: any[]
  height?: number
  maxHeight?: number
  minHeight?: number
  filter?: string | RegExp | types.AnyFn
}

const LunaDataGrid: FC<IDataGridProps> = (props) => {
  const dataGridRef = useRef<HTMLDivElement>(null)
  const dataGrid = useRef<DataGrid>()

  useEffect(() => {
    dataGrid.current = new DataGrid(dataGridRef.current!, {
      columns: props.columns,
      height: props.height,
      maxHeight: props.maxHeight,
      minHeight: props.minHeight,
      filter: props.filter,
    })
    if (props.onSelect) {
      dataGrid.current.on('select', props.onSelect)
    }
    if (props.onDeselect) {
      dataGrid.current.on('deselect', props.onDeselect)
    }
    setData(dataGrid, props.data)
  }, [])

  useEffect(() => setData(dataGrid, props.data), [props.data])
  useEffect(() => setOption(dataGrid, 'height', props.height), [props.height])
  useEffect(
    () => setOption(dataGrid, 'maxHeight', props.maxHeight),
    [props.maxHeight]
  )
  useEffect(
    () => setOption(dataGrid, 'minHeight', props.minHeight),
    [props.minHeight]
  )
  useEffect(() => setOption(dataGrid, 'filter', props.filter), [props.filter])

  return <div className={props.className || ''} ref={dataGridRef}></div>
}

function setData(
  dataGrid: React.MutableRefObject<DataGrid | undefined>,
  data: any = []
) {
  if (dataGrid.current) {
    dataGrid.current.clear()
    each(data, (item: any) =>
      dataGrid.current?.append(item, { selectable: true })
    )
  }
}

function setOption(
  dataGrid: React.MutableRefObject<DataGrid | undefined>,
  name: string,
  val: any
) {
  if (dataGrid.current) {
    dataGrid.current.setOption(name, val)
  }
}

export default LunaDataGrid
