import {
  Children,
  FC,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
} from 'react'
import Tab, { IOptions } from './index'
import {
  useEvent,
  useForceUpdate,
  useOption,
  usePrevious,
} from '../share/hooks'
import each from 'licia/each'

interface ITabProps extends IOptions {
  className?: string
  height?: number
  onSelect?: (id: string) => void
  onDeselect?: () => void
  onCreate?: (tab: Tab) => void
}

const LunaTab: FC<PropsWithChildren<ITabProps>> = (props) => {
  const tabRef = useRef<HTMLDivElement>(null)
  const tab = useRef<Tab>()
  const prevProps = usePrevious(props)
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    tab.current = new Tab(tabRef.current!, {
      height: props.height,
      theme: props.theme,
    })
    props.onCreate && props.onCreate(tab.current)

    forceUpdate()

    return () => tab.current?.destroy()
  }, [])

  useEvent<Tab>(tab, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<Tab>(tab, 'deselect', prevProps?.onDeselect, props.onDeselect)

  each(['theme', 'height'], (key: keyof ITabProps) => {
    useOption<Tab, ITabProps>(tab, key, props[key])
  })

  return (
    <div className={props.className || ''} ref={tabRef}>
      {Children.map(props.children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement, {
            tab: tab.current,
          })
        }
      })}
    </div>
  )
}

interface ITabItemProps {
  tab?: Tab
  selected?: boolean
  id: string
  title: string
}

export const LunaTabItem: FC<ITabItemProps> = (props) => {
  useEffect(() => {
    if (props.tab) {
      props.tab.append({
        id: props.id,
        title: props.title,
      })
      if (props.selected) {
        props.tab.select(props.id)
      }
    }

    return () => props.tab?.remove(props.id)
  }, [props.tab])

  useEffect(() => {
    if (props.tab) {
      if (props.selected) {
        props.tab.select(props.id)
      }
    }
  }, [props.selected])

  return null
}

export default LunaTab
