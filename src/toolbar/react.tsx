import {
  Children,
  cloneElement,
  FC,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useState,
} from 'react'
import { classPrefix } from '../share/util'
import { IComponentOptions } from '../share/Component'
import { Component } from '../share/react'
import className from 'licia/className'
import types from 'licia/types'
import map from 'licia/map'
import uniqId from 'licia/uniqId'
import toStr from 'licia/toStr'
import { IButtonState } from 'luna-toolbar'

const c = classPrefix('toolbar')

interface IToolbarProps extends IComponentOptions {
  className?: string
  onChange?: (key: string, val: any, oldVal: any) => void
}

const LunaToolbar: FC<PropsWithChildren<IToolbarProps>> = (props) => {
  const children = Children.map(props.children, (child) => {
    if (isValidElement(child)) {
      const childProps: Partial<any> & React.Attributes = {}
      const keyName = child.props.keyName
      if (keyName) {
        const onChange = child.props.onChange
        childProps.onChange = (val: any, oldVal: any) => {
          onChange && onChange(val, oldVal)
          props.onChange && props.onChange(keyName, val, oldVal)
        }
      }

      return cloneElement(child as ReactElement, childProps)
    }
  })

  return (
    <Component
      compName="toolbar"
      theme={props.theme}
      className={props.className}
    >
      {children}
    </Component>
  )
}

interface IToolbarItemProps {
  disabled?: boolean
  onChange?: (val: any, oldVal: any) => void
  className?: string
}

const LunaToolbarItem: FC<
  PropsWithChildren<
    IToolbarItemProps & {
      type: string
      dangerouslySetInnerHTML?: { __html: string }
    }
  >
> = (props) => {
  return (
    <div
      className={className(
        c(`item item-${props.type} ${props.disabled ? 'disabled' : ''}`),
        props.className
      )}
      dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}
    >
      {props.children}
    </div>
  )
}

interface IToolbarTextProps extends IToolbarItemProps {
  text: string
}

export const LunaToolbarText: FC<IToolbarTextProps> = (props) => {
  return (
    <LunaToolbarItem {...props} type="text">
      {props.text}
    </LunaToolbarItem>
  )
}

interface IToolbarButtonProps extends IToolbarItemProps {
  onClick: () => void
  state?: IButtonState
}

export const LunaToolbarButton: FC<PropsWithChildren<IToolbarButtonProps>> = (
  props
) => {
  return (
    <LunaToolbarItem {...props} type="button">
      <button
        className={props.state ? c(props.state) : ''}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    </LunaToolbarItem>
  )
}

interface IToolbarSelectProps extends IToolbarItemProps {
  keyName: string
  value: string
  title?: string
  options: types.PlainObj<string>
}

export const LunaToolbarSelect: FC<IToolbarSelectProps> = (props) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChange && props.onChange(e.target.value, props.value)
  }

  return (
    <LunaToolbarItem {...props} type="select">
      <select title={props.title} value={props.value} onChange={onChange}>
        {map(props.options, (val, key) => (
          <option key={val} value={val}>
            {key}
          </option>
        ))}
      </select>
    </LunaToolbarItem>
  )
}

interface IToolbarInputProps extends IToolbarItemProps {
  keyName: string
  value: string
  placeholder?: string
}

export const LunaToolbarInput: FC<IToolbarInputProps> = (props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(e.target.value, props.value)
  }

  return (
    <LunaToolbarItem {...props} type="input">
      <input
        type="text"
        value={props.value}
        onChange={onChange}
        placeholder={props.placeholder}
      />
    </LunaToolbarItem>
  )
}

interface IToolbarNumberProps extends IToolbarItemProps {
  keyName: string
  value: number
  min?: number
  max?: number
  step?: number
}

export const LunaToolbarNumber: FC<IToolbarNumberProps> = (props) => {
  const [value, setValue] = useState(toStr(props.value))
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      setValue(e.target.value)
      props.onChange(e.target.value, props.value)
    }
  }

  return (
    <LunaToolbarItem {...props} type="number">
      <input
        type="number"
        value={value !== '' ? props.value : value}
        onChange={onChange}
        min={props.min || 0}
        max={props.max || 10}
        step={props.step || 1}
      />
    </LunaToolbarItem>
  )
}

export const LunaToolbarSeparator: FC<IToolbarItemProps> = (props) => {
  return <div className={c('item item-separator')} />
}

export const LunaToolbarSpace: FC<IToolbarItemProps> = (props) => {
  return <div className={c('item item-space')} />
}

export const LunaToolbarHtml: FC<PropsWithChildren<IToolbarItemProps>> = (
  props
) => {
  return (
    <LunaToolbarItem {...props} type="html">
      {props.children}
    </LunaToolbarItem>
  )
}

interface IToolbarCheckboxProps extends IToolbarItemProps {
  keyName: string
  value: boolean
  label: string
}

export const LunaToolbarCheckbox: FC<IToolbarCheckboxProps> = (props) => {
  const id = uniqId(c('checkbox-'))

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(e.target.checked, props.value)
  }

  return (
    <LunaToolbarItem {...props} type="checkbox">
      <input
        type="checkbox"
        id={id}
        checked={props.value}
        onChange={onChange}
      />
      <label htmlFor={id}>{props.label}</label>
    </LunaToolbarItem>
  )
}

export default LunaToolbar
