import {
  PropsWithChildren,
  FC,
  useRef,
  useEffect,
  cloneElement,
  Children,
  ReactElement,
  useState,
} from 'react'
import types from 'licia/types'
import Toolbar from './index'

interface IToolbarProps {}

const LunaToolbar: FC<PropsWithChildren<IToolbarProps>> = (props) => {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const toolbar = useRef<Toolbar>()
  const [_, setForceUpdateValue] = useState(0)
  const forceUpdate = () => setForceUpdateValue((value) => value + 1)

  useEffect(() => {
    toolbar.current = new Toolbar(toolbarRef.current!)
    forceUpdate()

    return () => toolbar.current?.destroy()
  }, [])

  return (
    <div ref={toolbarRef}>
      {Children.map(props.children, (child) =>
        cloneElement(child as ReactElement, {
          toolbar: toolbar.current,
        })
      )}
    </div>
  )
}

interface IToolbarItemProps {
  toolbar?: Toolbar
}

interface IToolbarTextProps extends IToolbarItemProps {
  text: string
}

export const LunaToolbarText: FC<IToolbarTextProps> = (props) => {
  useEffect(() => {
    if (props.toolbar) {
      props.toolbar.appendText(props.text)
    }
  }, [props.toolbar])

  return null
}

interface IToolbarSelectProps extends IToolbarItemProps {
  key: string
  value: string
  title?: string
  options: types.PlainObj<string>
}

export const LunaToolbarSelect: FC<IToolbarSelectProps> = (props) => {
  useEffect(() => {
    const { toolbar, title, key, value, options } = props
    if (toolbar) {
      if (title) {
        toolbar.appendSelect(key, value, title, options)
      } else {
        toolbar.appendSelect(key, value, options)
      }
    }
  }, [props.toolbar])

  return null
}

export const LunaToolbarSeparator: FC<IToolbarItemProps> = (props) => {
  useEffect(() => {
    if (props.toolbar) {
      props.toolbar.appendSeparator()
    }
  }, [props.toolbar])

  return null
}

export const LunaToolbarSpace: FC<IToolbarItemProps> = (props) => {
  useEffect(() => {
    if (props.toolbar) {
      props.toolbar.appendSpace()
    }
  }, [props.toolbar])

  return null
}

export default LunaToolbar
