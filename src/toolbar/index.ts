import h from 'licia/h'
import $ from 'licia/$'
import isObj from 'licia/isObj'
import map from 'licia/map'
import escape from 'licia/escape'
import types, { PlainObj } from 'licia/types'
import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Application toolbar.
 */
export default class Toolbar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'toolbar' })
  }
  /** Append text. */
  appendText(text: string) {
    const toolbarText = new ToolbarText(this, text)
    this.append(toolbarText)

    return toolbarText
  }
  /** Append select. */
  appendSelect(
    key: string,
    value: string,
    options: types.PlainObj<string>
  ): ToolbarSelect
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

    const toolbarSelect = new ToolbarSelect(
      this,
      key,
      value,
      title as string,
      options as types.PlainObj<string>
    )
    this.append(toolbarSelect)

    return toolbarSelect
  }
  /** Append separator. */
  appendSeparator() {
    const toolbarSeparator = new ToolbarSeparator(this)
    this.append(toolbarSeparator)

    return toolbarSeparator
  }
  /** Append text input. */
  appendInput(key: string, value: string, placeholder: string = '') {
    const toolbarInput = new ToolbarInput(this, key, value, placeholder)
    this.append(toolbarInput)

    return toolbarInput
  }
  private append(item: ToolbarItem) {
    this.$container.append(item.container)
  }
}

class ToolbarItem {
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
  protected onChange(value: any) {
    this.toolbar.emit('change', this.key, value, this.value)
    this.value = value
  }
}

class ToolbarSelect extends ToolbarItem {
  constructor(
    toolbar: Toolbar,
    key: string,
    value: string,
    title: string,
    options: types.PlainObj<string>
  ) {
    super(toolbar, key, value, 'select')

    this.$container.html(
      `<select title="${escape(title)}">
        ${map(
          options,
          (val, key) =>
            `<option value="${escape(val)}"${
              val === value ? ' selected' : ''
            }>${escape(key)}</option>`
        ).join('')}
      </select>`
    )

    const $select = this.$container.find('select')
    $select.on('change', () => this.onChange($select.val()))
  }
}

class ToolbarInput extends ToolbarItem {
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

class ToolbarSeparator extends ToolbarItem {
  constructor(toolbar: Toolbar) {
    super(toolbar, '', '', 'separator')
  }
}

class ToolbarText extends ToolbarItem {
  constructor(toolbar: Toolbar, text: string) {
    super(toolbar, '', '', 'text')
    this.$container.text(text)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Toolbar)
}
