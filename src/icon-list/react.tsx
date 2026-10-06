import { FC, useEffect, useRef } from 'react'
import IconList, { IOptions, IIcon, Icon } from './index'
import { useEvent, useOption, usePrevious } from '../share/hooks'
import each from 'licia/each'

interface IIconListProps extends IOptions {
  className?: string
  style?: React.CSSProperties
  onSelect?: (icon: Icon | Icon[]) => void
  onDeselect?: () => void
  onClick?: (e: MouseEvent, icon: Icon | Icon[]) => void
  onDoubleClick?: (e: MouseEvent, icon: Icon | Icon[]) => void
  onContextMenu?: (e: PointerEvent, icon: Icon | Icon[]) => void
  onCreate?: (iconList: IconList) => void
  icons: Array<IIcon>
}

const LunaIconList: FC<IIconListProps> = (props) => {
  const iconListRef = useRef<HTMLDivElement>(null)
  const iconList = useRef<IconList>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    iconList.current = new IconList(iconListRef.current!, {
      size: props.size,
      selectable: props.selectable,
      multiSelections: props.multiSelections,
      filter: props.filter,
      hotkey: props.hotkey,
    })
    props.onCreate && props.onCreate(iconList.current)

    return () => iconList.current?.destroy()
  }, [])

  useEffect(() => {
    if (iconList.current) {
      iconList.current.setIcons(props.icons)
    }
  }, [props.icons])

  useEvent<IconList>(iconList, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<IconList>(
    iconList,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )
  useEvent<IconList>(iconList, 'click', prevProps?.onClick, props.onClick)
  useEvent<IconList>(
    iconList,
    'dblclick',
    prevProps?.onDoubleClick,
    props.onDoubleClick
  )
  useEvent<IconList>(
    iconList,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )

  each(
    ['theme', 'size', 'selectable', 'multiSelections', 'filter', 'hotkey'],
    (key: keyof IOptions) => {
      useOption<IconList, IOptions>(iconList, key, props[key])
    }
  )

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={iconListRef}
    />
  )
}

export default LunaIconList
