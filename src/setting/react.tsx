import {
  Children,
  FC,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  isValidElement,
  useState,
} from 'react'
import { IOptions } from './index'
import types from 'licia/types'
import { progress } from './util'
import { classPrefix } from '../share/util'
import isUndef from 'licia/isUndef'
import { micromark } from 'micromark'
import map from 'licia/map'
import className from 'licia/className'
import isRegExp from 'licia/isRegExp'
import uniqId from 'licia/uniqId'
import isStr from 'licia/isStr'
import trim from 'licia/trim'
import contain from 'licia/contain'
import lowerCase from 'licia/lowerCase'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import { Component } from '../share/react'

const c = classPrefix('setting')

interface ISettingProps extends IOptions {
  className?: string
  onChange?: (key: string, val: any, oldVal: any) => void
}

const LunaSetting: FC<PropsWithChildren<ISettingProps>> = (props) => {
  const [selectedIndex, setSelectedIdx] = useState(-1)

  let lastChild: ReactElement | null = null
  const children = Children.map(props.children, (child, index) => {
    if (isValidElement(child)) {
      const childProps: Partial<any> & React.Attributes = {
        selected: selectedIndex === index,
        onSelect: () => setSelectedIdx(index),
      }
      const keyName = child.props.keyName
      if (keyName) {
        childProps.onChange = (val: any, oldVal: any) => {
          props.onChange && props.onChange(keyName, val, oldVal)
        }
      }
      let filter = props.filter
      if (filter) {
        const title = child.props.title || ''
        const description = child.props.description || ''
        const text = title + '\n' + description
        if (isRegExp(filter)) {
          if (!filter.test(text)) {
            return null
          }
        } else if (isStr(filter)) {
          filter = trim(filter)
          if (filter && !contain(lowerCase(text), lowerCase(filter))) {
            return null
          }
        }
      }

      if (child.type === LunaSettingSeparator && props.separatorCollapse) {
        if (lastChild && lastChild.type === LunaSettingSeparator) {
          return null
        }
      }

      lastChild = cloneElement(child as ReactElement, childProps)
      return lastChild
    }
  })

  return (
    <Component compName="setting" theme={props.theme}>
      {children}
    </Component>
  )
}

interface ISettingItemProps {
  disabled?: boolean
  selected?: boolean
  onChange?: (val: any, oldVal: any) => void
  onSelect?: () => void
}

interface ISettingTitleProps extends ISettingItemProps {
  title: string
  level?: number
}

const LunaSettingItem: FC<
  ISettingItemProps & {
    type: string
    className?: string
    dangerouslySetInnerHTML?: { __html: string }
  }
> = (props) => {
  return (
    <div
      tabIndex={0}
      onClick={props.onSelect}
      className={className(
        c(`item item-${props.type} ${props.disabled ? 'disabled' : ''}`),
        {
          [c('selected')]: props.selected,
        },
        props.className
      )}
      dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}
    >
      {props.children}
    </div>
  )
}

export const LunaSettingTitle: FC<ISettingTitleProps> = (props) => {
  const level = isUndef(props.level) ? 1 : props.level

  return (
    <LunaSettingItem {...props} type="title" className={c(`level-${level}`)}>
      {props.title}
    </LunaSettingItem>
  )
}

interface ISettingMarkdownProps extends ISettingItemProps {
  markdown: string
}

export const LunaSettingMarkdown: FC<ISettingMarkdownProps> = (props) => {
  return (
    <LunaSettingItem
      {...props}
      type="markdown"
      dangerouslySetInnerHTML={{ __html: micromark(props.markdown) }}
    />
  )
}

interface ISettingSelectProps extends ISettingItemProps {
  keyName: string
  value: string
  title: string
  description?: string
  options: types.PlainObj<string>
}

export const LunaSettingSelect: FC<ISettingSelectProps> = (props) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChange && props.onChange(e.target.value, props.value)
  }

  return (
    <LunaSettingItem {...props} type="select">
      <div className={c('title')}>{props.title}</div>
      <div
        className={c('description')}
        dangerouslySetInnerHTML={{ __html: micromark(props.description || '') }}
      />
      <div className={c('control')}>
        <div className={c('select')}>
          <select
            value={props.value}
            onChange={onChange}
            disabled={props.disabled}
          >
            {map(props.options, (val, key) => (
              <option key={val} value={val}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>
    </LunaSettingItem>
  )
}

interface ISettingNumberProps extends ISettingItemProps {
  keyName: string
  value: number
  title: string
  description?: string
  min?: number
  max?: number
  step?: number
  range?: boolean
}

export const LunaSettingNumber: FC<ISettingNumberProps> = (props) => {
  const [value, setValue] = useState(toStr(props.value))
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      setValue(e.target.value)
      props.onChange && props.onChange(toNum(e.target.value), props.value)
    }
  }

  const max = props.max || Infinity
  const min = props.min || 0
  const step = props.step || 1
  let input = (
    <input
      type={props.range ? 'range' : 'number'}
      value={value !== '' ? props.value : value}
      onChange={onChange}
      disabled={props.disabled}
      min={min}
      max={max}
      step={step}
    />
  )

  if (props.range) {
    input = (
      <>
        {min}
        <div className={c('range-container')}>
          <div className={c('range-track')}>
            <div className={c('range-track-bar')}>
              <div
                className={c('range-track-progress')}
                style={{ width: `${progress(props.value, min, max)}%` }}
              ></div>
            </div>
          </div>
          {input}
        </div>
        <span className={c('value')}>{value}</span>/{max}
      </>
    )
  }

  return (
    <LunaSettingItem {...props} type="number">
      <div className={c('title')}>{props.title}</div>
      <div
        className={c('description')}
        dangerouslySetInnerHTML={{ __html: micromark(props.description || '') }}
      />
      <div className={c('control')}>{input}</div>
    </LunaSettingItem>
  )
}

export const LunaSettingSeparator: FC<ISettingItemProps> = (props) => {
  return <div className={c('item item-separator')} />
}

interface ISettingCheckboxProps extends ISettingItemProps {
  keyName: string
  value: boolean
  title?: string
  description: string
}

export const LunaSettingCheckbox: FC<ISettingCheckboxProps> = (props) => {
  const id = uniqId(c('checkbox-'))

  let title = props.title
  let description = props.description
  if (!description) {
    description = title || ''
    title = ''
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(e.target.checked, props.value)
  }

  return (
    <LunaSettingItem {...props} type="checkbox">
      <div className={c('title')}>{title}</div>
      <div className={c('control')}>
        <input
          type="checkbox"
          disabled={props.disabled}
          id={id}
          checked={props.value}
          onChange={onChange}
        />
        <label
          htmlFor={id}
          dangerouslySetInnerHTML={{ __html: micromark(description) }}
        />
      </div>
    </LunaSettingItem>
  )
}

interface ISettingTextProps extends ISettingItemProps {
  keyName: string
  value: string
  title: string
  description?: string
}

export const LunaSettingInput: FC<ISettingTextProps> = (props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(e.target.value, props.value)
  }

  return (
    <LunaSettingItem {...props} type="input">
      <div className={c('title')}>{props.title}</div>
      <div
        className={c('description')}
        dangerouslySetInnerHTML={{ __html: micromark(props.description || '') }}
      />
      <div className={c('control')}>
        <input
          type="text"
          value={props.value}
          onChange={onChange}
          disabled={props.disabled}
        />
      </div>
    </LunaSettingItem>
  )
}

export const LunaSettingHtml: FC<PropsWithChildren<ISettingItemProps>> = (
  props
) => {
  return (
    <LunaSettingItem {...props} type="html">
      {props.children}
    </LunaSettingItem>
  )
}

interface ISettingButtonProps extends ISettingItemProps {
  title?: string
  description: string
  onClick: () => void
}

export const LunaSettingButton: FC<ISettingButtonProps> = (props) => {
  return (
    <LunaSettingItem {...props} type="button">
      <div className={c('title')}>{props.title}</div>
      <div className={c('control')}>
        <button onClick={props.onClick}>{props.description}</button>
      </div>
    </LunaSettingItem>
  )
}

export default LunaSetting
