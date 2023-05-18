import h from 'licia/h'
import $ from 'licia/$'
import isObj from 'licia/isObj'
import map from 'licia/map'
import each from 'licia/each'
import escape from 'licia/escape'
import types, { PlainObj } from 'licia/types'
import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Application toolbar.
 */
export default class Toolbar extends Component {
  private items: ToolbarItem[] = []
  constructor(container: HTMLElement) {
    super(container, { compName: 'toolbar' })
  }
  /** Remove item. */
  remove(item: ToolbarItem) {
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
    const toolbarText = new ToolbarText(this, text)
    this.append(toolbarText)

    return toolbarText
  }
  /** Append html. */
  appendHtml(html: string | HTMLElement) {
    const toolbarHtml = new ToolbarHtml(this, html)
    this.append(toolbarHtml)

    return toolbarHtml
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
    title: string,
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
    this.items.push(item)
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
  private $select: $.$
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
        
      </select>`
    )
    const $select = this.$container.find('select')
    this.$select = $select
    this.setOptions(options)
    $select.on('change', () => this.onChange($select.val()))
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
    this.setText(text)
  }
  setText(text: string) {
    this.$container.text(text)
  }
}

class ToolbarHtml extends ToolbarItem {
  constructor(toolbar: Toolbar, html: string | HTMLElement) {
    super(toolbar, '', '', 'html')
    this.$container.append(html)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Toolbar)
}
