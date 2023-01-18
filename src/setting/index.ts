import $ from 'licia/$'
import h from 'licia/h'
import escape from 'licia/escape'
import uniqId from 'licia/uniqId'
import types from 'licia/types'
import isObj from 'licia/isObj'
import defaults from 'licia/defaults'
import map from 'licia/map'
import toNum from 'licia/toNum'
import toStr from 'licia/toStr'
import isFn from 'licia/isFn'
import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Whether to collapse separator or not. */
  separatorCollapse?: boolean
}

/**
 * Settings panel.
 *
 * @example
 * const setting = new LunaSetting(container)
 * const title = setting.appendTitle('Title')
 * setting.appendSeparator()
 * title.detach()
 */
export default class Setting extends Component<IOptions> {
  private lastItem?: SettingItem
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'setting' }, options)

    this.initOptions(options, {
      separatorCollapse: true,
    })
  }
  /** Append title. */
  appendTitle(title: string) {
    const settingTitle = new SettingTitle(this, title)
    this.append(settingTitle)

    return settingTitle
  }
  /** Append separator. */
  appendSeparator() {
    const { lastItem } = this
    const { separatorCollapse } = this.options
    if (separatorCollapse && lastItem instanceof SettingSeparator) {
      return lastItem
    }

    const settingSeparator = new SettingSeparator(this)
    this.append(settingSeparator)

    return settingSeparator
  }
  /** Append number setting. */
  appendNumber(
    key: string,
    value: number,
    title: string,
    description: string,
    options: INumberOptions
  ): SettingNumber
  appendNumber(
    key: string,
    value: number,
    title: string,
    options: INumberOptions
  ): SettingNumber
  appendNumber(
    key: string,
    value: number,
    title: string,
    description: string | INumberOptions,
    options?: INumberOptions
  ) {
    if (isObj(description)) {
      options = description as INumberOptions
      description = ''
    }

    const settingNumber = new SettingNumber(
      this,
      key,
      value,
      title,
      description as string,
      options
    )
    this.append(settingNumber)

    return settingNumber
  }
  /** Append button. */
  appendButton(
    title: string,
    description: string,
    handler: types.AnyFn
  ): SettingButton
  appendButton(description: string, handler: types.AnyFn): SettingButton
  appendButton(
    title: string,
    description: string | types.AnyFn,
    handler?: types.AnyFn
  ) {
    if (isFn(description)) {
      handler = description as types.AnyFn
      description = ''
    }

    const settingButton = new SettingButton(
      this,
      title,
      description as string,
      handler as types.AnyFn
    )
    this.append(settingButton)

    return settingButton
  }
  /** Append text input setting. */
  appendInput(
    key: string,
    value: string,
    title: string,
    description: string = ''
  ) {
    const settingInput = new SettingInput(this, key, value, title, description)
    this.append(settingInput)

    return settingInput
  }
  /** Append checkbox setting. */
  appendCheckbox(
    key: string,
    value: boolean,
    title: string,
    description?: string
  ) {
    if (!description) {
      description = title
      title = ''
    }

    const settingCheckbox = new SettingCheckbox(
      this,
      key,
      value,
      title,
      description
    )
    this.append(settingCheckbox)

    return settingCheckbox
  }
  /** Append select setting. */
  appendSelect(
    key: string,
    value: string,
    title: string,
    description: string,
    options: types.PlainObj<string>
  ): SettingSelect
  appendSelect(
    key: string,
    value: string,
    title: string,
    options: types.PlainObj<string>
  ): SettingSelect
  appendSelect(
    key: string,
    value: string,
    title: string,
    description: string | types.PlainObj<string>,
    options?: types.PlainObj<string>
  ) {
    if (isObj(description)) {
      options = description as types.PlainObj<string>
      description = ''
    }

    const settingSelect = new SettingSelect(
      this,
      key,
      value,
      title,
      description as string,
      options as types.PlainObj<string>
    )
    this.append(settingSelect)

    return settingSelect
  }
  /** Clear all settings. */
  clear() {
    this.$container.text('')
  }
  private append(item: SettingItem) {
    this.lastItem = item
    this.$container.append(item.container)
  }
}

class SettingItem {
  container: HTMLElement = h('div')
  $container: $.$
  key: string
  value: any
  setting: Setting
  constructor(setting: Setting, key: string, value: any, type: string) {
    this.setting = setting
    this.$container = $(this.container)
    this.$container
      .addClass(setting.c('item'))
      .addClass(setting.c(`item-${type}`))
    this.key = key
    this.value = value
  }
  detach() {
    this.$container.remove()
  }
  protected onChange(value: any) {
    this.setting.emit('change', this.key, value, this.value)
    this.value = value
  }
}

class SettingTitle extends SettingItem {
  constructor(setting: Setting, title: string) {
    super(setting, '', '', 'title')
    this.$container.text(title)
  }
}

class SettingSeparator extends SettingItem {
  constructor(setting: Setting) {
    super(setting, '', '', 'separator')
  }
}

class SettingInput extends SettingItem {
  constructor(
    setting: Setting,
    key: string,
    value: string,
    title: string,
    description: string
  ) {
    super(setting, key, value, 'input')

    this.$container.html(
      setting.c(`<div class="title">${escape(title)}</div>
      <div class="description">${escape(description)}</div>
      <div class="control">
        <input type="text"></input>
      </div>`)
    )

    const $input = this.$container.find('input')
    $input.val(value)

    $input.on('change', () => this.onChange($input.val()))
  }
}

/** INumberOptions */
export interface INumberOptions {
  /** Min value. */
  min?: number
  /** Max value. */
  max?: number
  /** Interval between legal numbers. */
  step?: number
  /** Use slider control or not. */
  range?: boolean
}

class SettingNumber extends SettingItem {
  constructor(
    setting: Setting,
    key: string,
    value: number,
    title: string,
    description: string,
    options: INumberOptions = {}
  ) {
    super(setting, key, value, 'number')

    defaults(options, {
      min: 0,
      max: 10,
      step: 1,
    })

    const { $container } = this
    const range = !!options.range
    delete options.range
    const min = options.min as number
    const max = options.max as number

    let input = `<input type="${range ? 'range' : 'number'}"${map(
      options as any,
      (val, key) => ` ${key}="${val}"`
    )}></input>`
    if (range) {
      console.log(value, min, max)
      input = `${min}<div class="range-container">
        <div class="range-track">
          <div class="range-track-bar">
            <div class="range-track-progress" style="width: ${progress(
              value,
              min,
              max
            )}%;"></div>
          </div>
        </div>
        ${input}
      </div><span class="value">${value}</span>/${max}`
    }

    $container.html(
      setting.c(`<div class="title">${escape(title)}</div>
      <div class="description">${escape(description)}</div>
      <div class="control">${input}</div>`)
    )

    const $value = $container.find(setting.c('.value'))
    const $input = $container.find('input')
    const $trackProgress = $container.find(setting.c('.range-track-progress'))

    $input.val(toStr(value))
    $input.on('change', () => {
      const val = toNum($input.val())
      this.onChange(val)
    })
    $input.on('input', () => {
      const val = toNum($input.val())
      $trackProgress.css('width', progress(val, min, max) + '%')
      $value.text(toStr(val))
    })
  }
}

const progress = (val: number, min: number, max: number) => {
  return (((val - min) / (max - min)) * 100).toFixed(2)
}

class SettingCheckbox extends SettingItem {
  constructor(
    setting: Setting,
    key: string,
    value: boolean,
    title: string,
    description: string
  ) {
    super(setting, key, value, 'checkbox')

    const id = uniqId(setting.c('checkbox-'))

    this.$container.html(
      setting.c(`<div class="title">${escape(title)}</div>
      <div class="control">
        <input type="checkbox" id="${id}"></input>
        <label for="${id}">${escape(description)}</label>
      </div>`)
    )

    const $input = this.$container.find('input')
    const input = $input.get(0) as HTMLInputElement
    input.checked = value

    $input.on('change', () => this.onChange(input.checked))
  }
}

class SettingSelect extends SettingItem {
  constructor(
    setting: Setting,
    key: string,
    value: string,
    title: string,
    description: string,
    options: types.PlainObj<string>
  ) {
    super(setting, key, value, 'select')

    this.$container.html(
      setting.c(`<div class="title">${escape(title)}</div>
      <div class="description">${escape(description)}</div>
      <div class="control">
        <div class="select">
          <select>
            ${map(
              options,
              (val, key) =>
                `<option value="${escape(val)}"${
                  val === value ? ' selected' : ''
                }>${escape(key)}</option>`
            ).join('')}
          </select>
        </div>
      </div>`)
    )

    const $select = this.$container.find('select')
    $select.on('change', () => this.onChange($select.val()))
  }
}

class SettingButton extends SettingItem {
  constructor(
    setting: Setting,
    title: string,
    description: string,
    handler: types.AnyFn
  ) {
    super(setting, '', '', 'button')

    if (!description) {
      description = title
      title = ''
    }

    this.$container.html(
      setting.c(`<div class="title">${escape(title)}</div>
      <div class="control">
        <button>${description}</button>
      </div>`)
    )

    const $button = this.$container.find('button')
    $button.on('click', handler)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Setting)
}
