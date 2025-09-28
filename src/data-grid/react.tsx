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
  onCreate?: (dataGrid: DataGrid) => void
  onColumnChange?: () => void
  className?: string
  uniqueId?: string
  data: any[]
}

const LunaDataGrid: FC<IDataGridProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    dataGridRef.current = new DataGrid(containerRef.current!, {
      columns: props.columns,
      height: props.height,
      maxHeight: props.maxHeight,
      minHeight: props.minHeight,
      filter: props.filter,
      selectable: props.selectable,
      headerContextMenu: props.headerContextMenu,
      theme: props.theme,
    })
    props.onCreate && props.onCreate(dataGridRef.current)
    dataGridRef.current.setData(props.data, props.uniqueId)

    return () => dataGridRef.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (dataGridRef.current) {
      dataGridRef.current.setData(props.data, props.uniqueId)
    }
  }, [props.data])

  useEvent<DataGrid>(dataGridRef, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<DataGrid>(
    dataGridRef,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )
  useEvent<DataGrid>(dataGridRef, 'click', prevProps?.onClick, props.onClick)
  useEvent<DataGrid>(
    dataGridRef,
    'dblclick',
    prevProps?.onDoubleClick,
    props.onDoubleClick
  )
  useEvent<DataGrid>(
    dataGridRef,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )
  useEvent<DataGrid>(
    dataGridRef,
    'changeColumn',
    prevProps?.onColumnChange,
    props.onColumnChange
  )

  each(
    ['theme', 'height', 'maxHeight', 'minHeight', 'filter', 'columns'],
    (key: keyof IDataGridProps) => {
      useOption<DataGrid, IDataGridProps>(dataGridRef, key, props[key])
    }
  )

  return <div className={props.className || ''} ref={containerRef}></div>
}

export default LunaDataGrid
