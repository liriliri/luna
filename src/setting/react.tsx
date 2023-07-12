import {
  Children,
  FC,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  useEffect,
  useRef,
} from 'react'
import types from 'licia/types'
import Setting, {
  LunaSettingTitle as SettingTitle,
  LunaSettingMarkdown as SettingMarkdown,
  LunaSettingSelect as SettingSelect,
  LunaSettingNumber as SettingNumber,
  LunaSettingSeparator as SettingSeparator,
  LunaSettingCheckbox as SettingCheckbox,
  LunaSettingText as SettingText,
  LunaSettingHtml as SettingHtml,
  LunaSettingButton as SettingButton,
  LunaSettingItem,
  INumberOptions,
} from './index'
import { useForceUpdate } from '../share/hooks'
import { createPortal } from 'react-dom'

interface ISettingProps {
  separatorCollapse?: boolean
  filter?: string | RegExp | types.AnyFn
  className?: string
  onChange?: (key: string, val: any, oldVal: any) => void
}

const LunaSetting: FC<PropsWithChildren<ISettingProps>> = (props) => {
  const settingRef = useRef<HTMLDivElement>(null)
  const setting = useRef<Setting>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    setting.current = new Setting(settingRef.current!, {
      separatorCollapse: props.separatorCollapse,
      filter: props.filter,
    })
    setting.current.on('change', (key, val, oldVal) => {
      props.onChange && props.onChange(key, val, oldVal)
    })
    forceUpdate()

    return () => setting.current?.destroy()
  }, [])

  return (
    <div className={props.className || ''} ref={settingRef}>
      {Children.map(props.children, (child) =>
        cloneElement(child as ReactElement, {
          setting: setting.current,
        })
      )}
    </div>
  )
}

interface ISettingItemProps {
  setting?: Setting
  disabled?: boolean
}

interface ISettingTitleProps extends ISettingItemProps {
  title: string
  level?: number
}

export const LunaSettingTitle: FC<ISettingTitleProps> = (props) => {
  const settingTitle = useRef<SettingTitle>()

  useEffect(() => {
    if (props.setting) {
      settingTitle.current = props.setting.appendTitle(props.title, props.level)
    }

    return () => settingTitle.current?.detach()
  }, [props.setting])

  return null
}

interface ISettingMarkdownProps extends ISettingItemProps {
  markdown: string
}

export const LunaSettingMarkdown: FC<ISettingMarkdownProps> = (props) => {
  const settingMarkdown = useRef<SettingMarkdown>()

  useEffect(() => {
    if (props.setting) {
      settingMarkdown.current = props.setting.appendMarkdown(props.markdown)
    }

    return () => settingMarkdown.current?.detach()
  }, [props.setting])

  return null
}

interface ISettingSelectProps extends ISettingItemProps {
  keyName: string
  value: string
  title: string
  description?: string
  options: types.PlainObj<string>
}

export const LunaSettingSelect: FC<ISettingSelectProps> = (props) => {
  const settingSelect = useRef<SettingSelect>()

  useEffect(() => {
    const { setting, title, keyName, value, description, options } = props

    if (setting) {
      if (description) {
        settingSelect.current = setting.appendSelect(
          keyName,
          value,
          title,
          description,
          options
        )
      } else {
        settingSelect.current = setting.appendSelect(
          keyName,
          value,
          title,
          options
        )
      }
      setDisabled(settingSelect.current, props.disabled)
    }

    return () => settingSelect.current?.detach()
  }, [props.setting])

  useEffect(
    () => setDisabled(settingSelect.current, props.disabled),
    [props.disabled]
  )

  useEffect(() => {
    if (settingSelect.current) {
      settingSelect.current.setOptions(props.options)
    }
  }, [props.options])

  return null
}

interface ISettingNumberProps extends ISettingItemProps {
  keyName: string
  value: number
  title: string
  description?: string
  options: INumberOptions
}

export const LunaSettingNumber: FC<ISettingNumberProps> = (props) => {
  const settingNumber = useRef<SettingNumber>()

  useEffect(() => {
    const { setting, keyName, value, title, description, options } = props

    if (setting) {
      if (description) {
        settingNumber.current = setting.appendNumber(
          keyName,
          value,
          title,
          description,
          options
        )
      } else {
        settingNumber.current = setting.appendNumber(
          keyName,
          value,
          title,
          options
        )
      }
      setDisabled(settingNumber.current, props.disabled)
    }

    return () => settingNumber.current?.detach()
  }, [props.setting])

  useEffect(
    () => setDisabled(settingNumber.current, props.disabled),
    [props.disabled]
  )

  return null
}

export const LunaSettingSeparator: FC<ISettingItemProps> = (props) => {
  const settingSeparator = useRef<SettingSeparator>()

  useEffect(() => {
    if (props.setting) {
      settingSeparator.current = props.setting.appendSeparator()
    }

    return () => settingSeparator.current?.detach()
  }, [props.setting])

  return null
}

interface ISettingCheckboxProps extends ISettingItemProps {
  keyName: string
  value: boolean
  title?: string
  description: string
}

export const LunaSettingCheckbox: FC<ISettingCheckboxProps> = (props) => {
  const settingCheckbox = useRef<SettingCheckbox>()

  useEffect(() => {
    if (props.setting) {
      let { title, description } = props
      if (!title) {
        title = description
        description = ''
      }
      settingCheckbox.current = props.setting.appendCheckbox(
        props.keyName,
        props.value,
        title,
        description
      )
      setDisabled(settingCheckbox.current, props.disabled)
    }

    return () => settingCheckbox.current?.detach()
  }, [props.setting])

  useEffect(
    () => setDisabled(settingCheckbox.current, props.disabled),
    [props.disabled]
  )

  return null
}

interface ISettingTextProps extends ISettingItemProps {
  keyName: string
  value: string
  title: string
  description?: string
}

export const LunaSettingText: FC<ISettingTextProps> = (props) => {
  const settingText = useRef<SettingText>()

  useEffect(() => {
    if (props.setting) {
      settingText.current = props.setting.appendText(
        props.keyName,
        props.value,
        props.title,
        props.description
      )
      setDisabled(settingText.current, props.disabled)
    }

    return () => settingText.current?.detach()
  }, [props.setting])

  useEffect(() => {
    setDisabled(settingText.current, props.disabled)
  }, [props.disabled])

  return null
}

export const LunaSettingHtml: FC<ISettingItemProps> = (props) => {
  const settingHtml = useRef<SettingHtml>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    if (props.setting) {
      settingHtml.current = props.setting.appendHtml('')
      forceUpdate()
    }

    return () => settingHtml.current?.detach()
  }, [props.setting])

  return settingHtml.current
    ? createPortal(<>{props.children}</>, settingHtml.current.container)
    : null
}

interface ISettingButtonProps extends ISettingItemProps {
  title?: string
  description: string
  onClick: () => void
}

export const LunaSettingButton: FC<ISettingButtonProps> = (props) => {
  const settingButton = useRef<SettingButton>()

  useEffect(() => {
    if (props.setting) {
      const { description, title, onClick } = props
      if (title) {
        settingButton.current = props.setting.appendButton(
          title,
          description,
          onClick
        )
      } else {
        settingButton.current = props.setting.appendButton(description, onClick)
      }
    }

    return () => settingButton.current?.detach()
  }, [props.setting])

  return null
}

function setDisabled(item?: LunaSettingItem, disabled = false) {
  if (!item) {
    return
  }

  if (disabled) {
    item.disable()
  } else {
    item.enable()
  }
}

export default LunaSetting
