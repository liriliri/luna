import { FC, useEffect, useRef } from 'react'
import FileList, { IOptions, IFile } from './index'
import each from 'licia/each'
import { useEvent, useOption, usePrevious } from '../share/hooks'

interface IFileListProps extends IOptions {
  className?: string
  style?: React.CSSProperties
  onSelect?: (file: IFile) => void
  onDeselect?: () => void
  onClick?: (e: MouseEvent, file: IFile) => void
  onDoubleClick?: (e: MouseEvent, file: IFile) => void
  onContextMenu?: (e: PointerEvent, file?: IFile) => void
}

const LunaFileList: FC<IFileListProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileListRef = useRef<FileList>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    fileListRef.current = new FileList(containerRef.current!, {
      files: props.files,
      listView: props.listView,
      filter: props.filter,
      columns: props.columns,
      theme: props.theme,
    })

    return () => fileListRef.current?.destroy()
  }, [])

  useEvent<FileList>(fileListRef, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<FileList>(
    fileListRef,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )
  useEvent<FileList>(fileListRef, 'click', prevProps?.onClick, props.onClick)
  useEvent<FileList>(
    fileListRef,
    'dblclick',
    prevProps?.onDoubleClick,
    props.onDoubleClick
  )
  useEvent<FileList>(
    fileListRef,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )

  each(['theme', 'filter', 'files', 'listView'], (key: keyof IOptions) => {
    useOption<FileList, IOptions>(fileListRef, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaFileList
