import { FC, useEffect, useRef } from 'react'
import DataGrid, { DataGridNode, IOptions } from './index'
import each from 'licia/each'
import lowerCase from 'licia/lowerCase'
import { useNonInitialEffect, usePrevious } from '../share/hooks'

interface IDataGridProps extends IOptions {
  onSelect?: (node: DataGridNode) => void
  onDeselect?: () => void
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
    })
    if (props.onSelect) {
      dataGrid.current.on('select', props.onSelect)
    }
    if (props.onDeselect) {
      dataGrid.current.on('deselect', props.onDeselect)
    }
    dataGrid.current.setData(props.data, props.uniqueId)
  }, [])

  useNonInitialEffect(() => {
    if (dataGrid.current) {
      dataGrid.current.setData(props.data, props.uniqueId)
    }
  }, [props.data])

  each(['onSelect', 'onDeselect'], (key: 'onSelect' | 'onDeselect') => {
    useNonInitialEffect(() => {
      if (dataGrid.current) {
        const event = lowerCase(key.slice(2))
        if (prevProps?.[key]) {
          dataGrid.current.off(event, prevProps[key])
        }
        if (props[key]) {
          dataGrid.current.on(event, props[key])
        }
      }
    }, [props[key]])
  })

  each(
    ['height', 'maxHeight', 'minHeight', 'filter'],
    (key: keyof IDataGridProps) => {
      useNonInitialEffect(() => {
        if (dataGrid.current) {
          dataGrid.current.setOption(key, props[key])
        }
      }, [props[key]])
    }
  )

  return <div className={props.className || ''} ref={dataGridRef}></div>
}

export default LunaDataGrid
