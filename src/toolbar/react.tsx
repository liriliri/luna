import {
  PropsWithChildren,
  FC,
  useRef,
  useEffect,
  cloneElement,
  Children,
  ReactElement,
  isValidElement,
} from 'react'
import types from 'licia/types'
import Toolbar, {
  LunaToolbarText as ToolbarText,
  LunaToolbarSelect as ToolbarSelect,
  LunaToolbarHtml as ToolbarHtml,
  LunaToolbarItem,
} from './index'
import { useForceUpdate } from '../share/hooks'
import { createPortal } from 'react-dom'

interface IToolbarProps {
  className?: string
  onChange?: (key: string, val: any, oldVal: any) => void
}

const LunaToolbar: FC<PropsWithChildren<IToolbarProps>> = (props) => {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const toolbar = useRef<Toolbar>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    toolbar.current = new Toolbar(toolbarRef.current!)
    toolbar.current.on('change', (key, val, oldVal) => {
      props.onChange && props.onChange(key, val, oldVal)
    })
    forceUpdate()

    return () => toolbar.current?.destroy()
  }, [])

  return (
    <div className={props.className || ''} ref={toolbarRef}>
      {Children.map(props.children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement, {
            toolbar: toolbar.current,
          })
        }
      })}
    </div>
  )
}

interface IToolbarItemProps {
  toolbar?: Toolbar
  disabled?: boolean
}

interface IToolbarTextProps extends IToolbarItemProps {
  text: string
}

export const LunaToolbarText: FC<IToolbarTextProps> = (props) => {
  const toolbarText = useRef<ToolbarText>()

  useEffect(() => {
    if (props.toolbar) {
      toolbarText.current = props.toolbar.appendText(props.text)
    }

    return () => toolbarText.current?.detach()
  }, [props.toolbar])

  return null
}

interface IToolbarSelectProps extends IToolbarItemProps {
  keyName: string
  value: string
  title?: string
  options: types.PlainObj<string>
}

export const LunaToolbarSelect: FC<IToolbarSelectProps> = (props) => {
  const toolbarSelect = useRef<ToolbarSelect>()

  useEffect(() => {
    const { toolbar, title, keyName, value, options } = props
    if (toolbar) {
      if (title) {
        toolbarSelect.current = toolbar.appendSelect(
          keyName,
          value,
          title,
          options
        )
      } else {
        toolbarSelect.current = toolbar.appendSelect(keyName, value, options)
      }
      setDisabled(toolbarSelect.current, props.disabled)
    }

    return () => toolbarSelect.current?.detach()
  }, [props.toolbar])

  useEffect(
    () => setDisabled(toolbarSelect.current, props.disabled),
    [props.disabled]
  )

  useEffect(() => {
    if (toolbarSelect.current) {
      toolbarSelect.current.setValue(props.value)
    }
  }, [props.value])

  useEffect(() => {
    if (toolbarSelect.current) {
      toolbarSelect.current.setOptions(props.options)
    }
  }, [props.options])

  return null
}

interface IToolbarInputProps extends IToolbarItemProps {
  keyName: string
  value: string
  placeholder?: string
}

export const LunaToolbarInput: FC<IToolbarInputProps> = (props) => {
  useEffect(() => {
    if (props.toolbar) {
      props.toolbar.appendInput(props.keyName, props.value, props.placeholder)
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

export const LunaToolbarHtml: FC<PropsWithChildren<IToolbarItemProps>> = (
  props
) => {
  const toolbarHtml = useRef<ToolbarHtml>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    if (props.toolbar) {
      toolbarHtml.current = props.toolbar.appendHtml('')
      forceUpdate()
      setDisabled(toolbarHtml.current, props.disabled)
    }

    return () => toolbarHtml.current?.detach()
  }, [props.toolbar])

  useEffect(
    () => setDisabled(toolbarHtml.current, props.disabled),
    [props.disabled]
  )

  return toolbarHtml.current
    ? createPortal(<>{props.children}</>, toolbarHtml.current.container)
    : null
}

function setDisabled(item?: LunaToolbarItem, disabled = false) {
  if (!item) {
    return
  }

  if (disabled) {
    item.disable()
  } else {
    item.enable()
  }
}

export default LunaToolbar
