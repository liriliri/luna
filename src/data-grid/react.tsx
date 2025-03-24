import { FC, useEffect, useRef } from 'react'
import DataGrid, { DataGridNode, IOptions } from './index'
import each from 'licia/each'
import {
  useEvent,
  useNonInitialEffect,
  useOption,
  usePrevious,
} from '../share/hooks'

interface IDataGridProps extends IOptions {
  onSelect?: (node: DataGridNode) => void
  onDeselect?: () => void
  onClick?: (e: MouseEvent, node: DataGridNode) => void
  onDoubleClick?: (e: MouseEvent, node: DataGridNode) => void
  onContextMenu?: (e: PointerEvent, node: DataGridNode) => void
  className?: string
  uniqueId?: string
  data: any[]
}

const LunaDataGrid: FC<IDataGridProps> = (props) => {
  const dataGridRef = useRef<HTMLDivElement>(null)
  const dataGrid = useRef<DataGrid>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    dataGrid.current = new DataGrid(dataGridRef.current!, {
      columns: props.columns,
      height: props.height,
      maxHeight: props.maxHeight,
      minHeight: props.minHeight,
      filter: props.filter,
      selectable: props.selectable,
      theme: props.theme,
    })
    dataGrid.current.setData(props.data, props.uniqueId)

    return () => dataGrid.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (dataGrid.current) {
      dataGrid.current.setData(props.data, props.uniqueId)
    }
  }, [props.data])

  useEvent<DataGrid>(dataGrid, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<DataGrid>(
    dataGrid,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )
  useEvent<DataGrid>(dataGrid, 'click', prevProps?.onClick, props.onClick)
  useEvent<DataGrid>(
    dataGrid,
    'dblclick',
    prevProps?.onDoubleClick,
    props.onDoubleClick
  )
  useEvent<DataGrid>(
    dataGrid,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )

  each(
    ['theme', 'height', 'maxHeight', 'minHeight', 'filter'],
    (key: keyof IDataGridProps) => {
      useOption<DataGrid, IDataGridProps>(dataGrid, key, props[key])
    }
  )

  return <div className={props.className || ''} ref={dataGridRef}></div>
}

export default LunaDataGrid
