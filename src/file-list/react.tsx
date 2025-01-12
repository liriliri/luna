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
  const fileListRef = useRef<HTMLDivElement>(null)
  const fileList = useRef<FileList>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    fileList.current = new FileList(fileListRef.current!, {
      files: props.files,
      listView: props.listView,
    })

    return () => fileList.current?.destroy()
  }, [])

  useEvent<FileList>(fileList, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<FileList>(
    fileList,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )
  useEvent<FileList>(fileList, 'click', prevProps?.onClick, props.onClick)
  useEvent<FileList>(
    fileList,
    'dblclick',
    prevProps?.onDoubleClick,
    props.onDoubleClick
  )
  useEvent<FileList>(
    fileList,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )

  each(['theme', 'files', 'listView'], (key: keyof IOptions) => {
    useOption<FileList, IOptions>(fileList, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={fileListRef}
    />
  )
}

export default LunaFileList
