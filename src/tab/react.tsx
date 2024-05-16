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
import Tab from './index'
import { useForceUpdate, useNonInitialEffect } from '../share/hooks'

interface ITabProps {
  className?: string
  height?: number
  onSelect?: (id: string) => void
  onDeselect?: () => void
  onCreate?: (tab: Tab) => void
}

const LunaTab: FC<PropsWithChildren<ITabProps>> = (props) => {
  const tabRef = useRef<HTMLDivElement>(null)
  const tab = useRef<Tab>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    tab.current = new Tab(tabRef.current!, {
      height: props.height,
    })
    props.onCreate && props.onCreate(tab.current)

    if (props.onSelect) {
      tab.current.on('select', props.onSelect)
    }
    if (props.onDeselect) {
      tab.current.on('deselect', props.onDeselect)
    }
    forceUpdate()

    return () => tab.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (tab.current) {
      tab.current.setOption('height', props.height)
    }
  }, [props.height])

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
