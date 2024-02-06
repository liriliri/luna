import h from 'licia/h'
import $ from 'licia/$'
import isObj from 'licia/isObj'
import map from 'licia/map'
import each from 'licia/each'
import escape from 'licia/escape'
import defaults from 'licia/defaults'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import types, { PlainObj } from 'licia/types'
import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Application toolbar.
 *
 * @example
 * const toolbar = new LunaToolbar(container)
 * toolbar.appendText('Test')
 */
export default class Toolbar extends Component {
  private items: LunaToolbarItem[] = []
  constructor(container: HTMLElement) {
    super(container, { compName: 'toolbar' })
  }
  /** Remove item. */
  remove(item: LunaToolbarItem) {
    const { items } = this
    const pos = items.indexOf(item)
    if (pos > -1) {
      item.detach()
      items.splice(pos, 1)
    }
  }
  /** Clear all. */
  clear() {
    each(this.items, (item) => item.detach())
    this.items = []
  }
  /** Append text. */
  appendText(text: string) {
    return this.append(new LunaToolbarText(this, text))
  }
  /** Append button. */
  appendButton(
    content: string | HTMLElement,
    handler: types.AnyFn,
    state?: IButtonState
  ) {
    return this.append(new LunaToolbarButton(this, content, handler, state))
  }
  /** Append html. */
  appendHtml(html: string | HTMLElement) {
    return this.append(new LunaToolbarHtml(this, html))
  }
  /** Append select. */
  appendSelect(
    key: string,
    value: string,
    options: types.PlainObj<string>
  ): LunaToolbarSelect
  appendSelect(
    key: string,
    value: string,
    title: string,
    options: types.PlainObj<string>
  ): LunaToolbarSelect
  appendSelect(
    key: string,
    value: string,
    title: string | types.PlainObj<string>,
    options?: PlainObj<string>
  ) {
    if (isObj(title)) {
      options = title as types.PlainObj<string>
      title = ''
    }

    return this.append(
      new LunaToolbarSelect(
        this,
        key,
        value,
        title as string,
        options as types.PlainObj<string>
      )
    )
  }
  /** Append number. */
  appendNumber(key: string, value: number, options?: INumberOptions) {
    return this.append(new LunaToolbarNumber(this, key, value, options))
  }
  /** Append separator. */
  appendSeparator() {
    return this.append(new ToolbarSeparator(this))
  }
  /** Append item that fills the remaining space. */
  appendSpace() {
    return this.append(new ToolbarSpace(this))
  }
  /** Append text input. */
  appendInput(key: string, value: string, placeholder = '') {
    return this.append(new LunaToolbarInput(this, key, value, placeholder))
  }
  private append<T extends LunaToolbarItem>(item: T): T {
    this.items.push(item)
    this.$container.append(item.container)
    return item
  }
}

export class LunaToolbarItem {
  container: HTMLElement = h('div')
  $container: $.$
  key: string
  value: any
  toolbar: Toolbar
  constructor(toolbar: Toolbar, key: string, value: any, type: string) {
    this.toolbar = toolbar
    ;(this.container as any).toolbarItem = this
    this.$container = $(this.container)
    this.$container
      .addClass(toolbar.c('item'))
      .addClass(toolbar.c(`item-${type}`))
    this.key = key
    this.value = value
  }
  detach() {
    this.$container.remove()
  }
  disable() {
    this.$container.addClass(this.toolbar.c('disabled'))
  }
  enable() {
    this.$container.rmClass(this.toolbar.c('disabled'))
  }
  protected onChange(value: any) {
    this.toolbar.emit('change', this.key, value, this.value)
    this.value = value
  }
}

export class LunaToolbarSelect extends LunaToolbarItem {
  private $select: $.$
  constructor(
    toolbar: Toolbar,
    key: string,
    value: string,
    title: string,
    options: types.PlainObj<string>
  ) {
    super(toolbar, key, value, 'select')

    this.$container.html(`<select title="${escape(title)}"></select>`)
    const $select = this.$container.find('select')
    this.$select = $select
    this.setOptions(options)
    $select.on('change', () => this.onChange($select.val()))
  }
  setValue(value: string) {
    this.$select.val(value)
    this.value = value
  }
  setOptions(options: types.PlainObj<string>) {
    this.$select.html(
      map(
        options,
        (val, key) =>
          `<option value="${escape(val)}"${
            val === this.value ? ' selected' : ''
          }>${escape(key)}</option>`
      ).join('')
    )
  }
}

export class LunaToolbarInput extends LunaToolbarItem {
  constructor(
    toolbar: Toolbar,
    key: string,
    value: string,
    placeholder: string
  ) {
    super(toolbar, key, value, 'input')
    this.$container.html(
      `<input type="text" placeholder="${escape(placeholder)}"></input>`
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
}

export class LunaToolbarNumber extends LunaToolbarItem {
  constructor(
    toolbar: Toolbar,
    key: string,
    value: number,
    options: INumberOptions = {}
  ) {
    super(toolbar, key, value, 'number')

    defaults(options, {
      min: 0,
      max: 10,
      step: 1,
    })

    this.$container.html(
      `<input type="number" ${map(
        options as any,
        (val, key) => ` ${key}="${val}"`
      )}></input>`
    )

    const $input = this.$container.find('input')
    $input.val(toStr(value))
    $input.on('change', () => {
      const val = toNum($input.val())
      this.onChange(val)
    })
  }
}

class ToolbarSeparator extends LunaToolbarItem {
  constructor(toolbar: Toolbar) {
    super(toolbar, '', '', 'separator')
  }
}

export class LunaToolbarText extends LunaToolbarItem {
  constructor(toolbar: Toolbar, text: string) {
    super(toolbar, '', '', 'text')
    this.setText(text)
  }
  setText(text: string) {
    this.$container.text(text)
  }
}

export type IButtonState = '' | 'hover' | 'active'

export class LunaToolbarButton extends LunaToolbarItem {
  private $button: $.$
  constructor(
    toolbar: Toolbar,
    content: string | HTMLElement,
    handler: types.AnyFn,
    state: IButtonState = ''
  ) {
    super(toolbar, '', '', 'button')

    this.$container.html(`<button></button>`)

    const $button = this.$container.find('button')
    $button.append(content)
    $button.on('click', handler)
    this.$button = $button

    this.setState(state)
  }
  setState(state: IButtonState) {
    const { $button } = this
    $button.rmAttr('class')
    if (state) {
      $button.addClass(this.toolbar.c(state))
    }
  }
}

export class LunaToolbarHtml extends LunaToolbarItem {
  constructor(toolbar: Toolbar, html: string | HTMLElement) {
    super(toolbar, '', '', 'html')
    this.$container.append(html)
  }
}

class ToolbarSpace extends LunaToolbarItem {
  constructor(toolbar: Toolbar) {
    super(toolbar, '', '', 'space')
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Toolbar)
}
