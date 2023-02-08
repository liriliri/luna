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
import last from 'licia/last'
import isRegExp from 'licia/isRegExp'
import isStr from 'licia/isStr'
import trim from 'licia/trim'
import contain from 'licia/contain'
import lowerCase from 'licia/lowerCase'
import isNull from 'licia/isNull'
import each from 'licia/each'
import { micromark } from 'micromark'
import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Whether to collapse separator or not. */
  separatorCollapse?: boolean
  /** Setting filter. */
  filter?: string | RegExp | types.AnyFn
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
  private items: SettingItem[] = []
  private selectedItem: SettingItem | null = null
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'setting' }, options)

    this.initOptions(options, {
      separatorCollapse: true,
      filter: '',
    })

    this.bindEvent()
  }
  /** Append title. */
  appendTitle(title: string) {
    const settingTitle = new SettingTitle(this, title)
    this.append(settingTitle)

    return settingTitle
  }
  /** Append separator. */
  appendSeparator() {
    const { items } = this
    const { separatorCollapse } = this.options
    const lastItem: SettingItem = last(items)
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
  /** Append html setting. */
  appendHtml(html: string | HTMLElement) {
    const settingHtml = new SettingHtml(this, html)
    this.append(settingHtml)
    return settingHtml
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
  /** Remove setting. */
  remove(item: SettingItem) {
    const { items } = this
    const pos = items.indexOf(item)
    if (pos > -1) {
      item.detach()
      items.splice(pos, 1)
      if (item === this.selectedItem) {
        this.selectItem(null)
      }
    }
  }
  /** Clear all settings. */
  clear() {
    each(this.items, (item) => item.detach())
    this.items = []
    this.selectItem(null)
  }
  private selectItem(item: SettingItem | null) {
    if (this.selectedItem) {
      this.selectedItem.deselect()
      this.selectedItem = null
    }
    if (!isNull(item)) {
      this.selectedItem = item
      this.selectedItem?.select()
    }
  }
  private renderSettings() {
    const { items } = this
    each(items, (item) => item.detach())
    each(items, (item) => {
      if (this.filterItem(item)) {
        this.$container.append(item.container)
      }
    })
  }
  private bindEvent() {
    const { c } = this

    this.on('optionChange', (name) => {
      switch (name) {
        case 'filter':
          this.renderSettings()
          break
      }
    })

    const self = this
    this.$container.on('click', c('.item'), function (this: any) {
      self.selectItem(this.settingItem)
    })
  }
  private filterItem(item: SettingItem) {
    let { filter } = this.options

    if (filter) {
      if (isFn(filter)) {
        return (filter as types.AnyFn)(item)
      } else if (isRegExp(filter)) {
        return (filter as RegExp).test(item.text())
      } else if (isStr(filter)) {
        filter = trim(filter as string)
        if (filter) {
          return contain(lowerCase(item.text()), lowerCase(filter))
        }
      }
    }

    return true
  }
  private append(item: SettingItem) {
    this.items.push(item)
    if (this.filterItem(item)) {
      this.$container.append(item.container)
    }
  }
}

class SettingItem {
  container: HTMLElement = h('div', {
    tabindex: '0',
  })
  $container: $.$
  key: string
  value: any
  setting: Setting
  constructor(setting: Setting, key: string, value: any, type: string) {
    this.setting = setting
    ;(this.container as any).settingItem = this
    this.$container = $(this.container)
    this.$container
      .addClass(setting.c('item'))
      .addClass(setting.c(`item-${type}`))
    this.key = key
    this.value = value
  }
  select() {
    this.$container.addClass(this.setting.c('selected'))
  }
  deselect() {
    this.$container.rmClass(this.setting.c('selected'))
  }
  detach() {
    this.$container.remove()
  }
  text() {
    return this.$container.text()
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
    const { c } = setting

    this.$container.html(`<div class="${c('title')}">${escape(title)}</div>
      <div class="${c('description')}">${micromark(description)}</div>
      <div class="${c('control')}">
        <input type="text"></input>
      </div>`)

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
    const { c } = setting
    const range = !!options.range
    delete options.range
    const min = options.min as number
    const max = options.max as number

    let input = `<input type="${range ? 'range' : 'number'}"${map(
      options as any,
      (val, key) => ` ${key}="${val}"`
    )}></input>`
    if (range) {
      input = `${min}<div class="${c('range-container')}">
        <div class="${c('range-track')}">
          <div class="${c('range-track-bar')}">
            <div class="${c('range-track-progress')}" style="width: ${progress(
        value,
        min,
        max
      )}%;"></div>
          </div>
        </div>
        ${input}
      </div><span class="${c('value')}">${value}</span>/${max}`
    }

    $container.html(
      `<div class="${c('title')}">${escape(title)}</div>
      <div class="${c('description')}">${micromark(description)}</div>
      <div class="${c('control')}">${input}</div>`
    )

    const $value = $container.find(c('.value'))
    const $input = $container.find('input')
    const $trackProgress = $container.find(c('.range-track-progress'))

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

    const { c } = setting
    const id = uniqId(setting.c('checkbox-'))

    this.$container.html(
      `<div class="${c('title')}">${escape(title)}</div>
      <div class="${c('control')}">
        <input type="checkbox" id="${id}"></input>
        <label for="${id}">${micromark(description)}</label>
      </div>`
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
    const { c } = setting

    this.$container.html(
      `<div class="${c('title')}">${escape(title)}</div>
      <div class="${c('description')}">${micromark(description)}</div>
      <div class="${c('control')}">
        <div class="${c('select')}">
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
      </div>`
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
        <button>${escape(description)}</button>
      </div>`)
    )

    const $button = this.$container.find('button')
    $button.on('click', handler)
  }
}

class SettingHtml extends SettingItem {
  constructor(setting: Setting, html: string | HTMLElement) {
    super(setting, '', '', 'html')
    this.$container.append(html)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Setting)
}
