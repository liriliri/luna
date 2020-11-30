import Emitter from 'licia/Emitter'
import $ from 'licia/$'
import h from 'licia/h'
import each from 'licia/each'
import isNull from 'licia/isNull'
import isArr from 'licia/isArr'
import map from 'licia/map'
import keys from 'licia/keys'
import contain from 'licia/contain'
import has from 'licia/has'
import './style.scss'
import './icon.css'

const classPrefix = 'luna-json-editor-'

// https://github.com/richard-livingston/json-view
module.exports = class JsonEditor extends (
  Emitter
) {
  public name: any
  public value: any
  private $container: $.$
  private $name: $.$
  private $toggle: $.$
  private $value: $.$
  private $delete: $.$
  private $children: $.$
  private $insert: $.$
  private type: string = 'unknown'
  private children: JsonEditor[] = []
  private expanded = false
  private edittingName = false
  private edittingValue = false
  private nameEditable = true
  private valueEditable = true
  constructor(container: Element, { name = undefined, value = null } = {}) {
    super()

    const $container = $(container)
    $container.addClass('luna-json-editor')
    this.$container = $container
    this.appendTpl()

    this.$toggle = $container.find(`.${classPrefix}toggle`)
    this.$name = $container.find(`.${classPrefix}name`)
    this.$value = $container.find(`.${classPrefix}value`)
    this.$delete = $container.find(`.${classPrefix}delete`)
    this.$children = $container.find(`.${classPrefix}children`)
    this.$insert = $container.find(`.${classPrefix}insert`)

    this.bindEvent()

    this.setName(name)
    this.setValue(value)
  }
  appendTpl() {
    this.$container.html(
      [
        `<div class="${classPrefix}toggle"><span class="${classPrefix}icon ${classPrefix}icon-arrow-right"></span><span class="${classPrefix}icon ${classPrefix}icon-arrow-down"></span></div>`,
        `<div class="${classPrefix}name"></div>`,
        `<div class="${classPrefix}separator"></div>`,
        `<div class="${classPrefix}value"></div>`,
        `<div class="${classPrefix}delete"><span class="${classPrefix}icon ${classPrefix}icon-delete"></span></div>`,
        `<div class="${classPrefix}children"></div>`,
        `<div class="${classPrefix}insert"><span class="${classPrefix}icon ${classPrefix}icon-add"></span></div>`,
      ].join('')
    )
  }
  bindEvent() {
    this.$toggle.on('click', this.onToggleClick)
    this.$name.on('dblclick', this.editName)
    this.$name.on('blur', this.editFieldStop.bind(this, 'name'))
    this.$name.on('keypress', this.editFieldKeyPressed.bind(this, 'name'))
    this.$name.on('keydown', this.editFieldTabPressed.bind(this, 'name'))
    this.$value.on('dblclick', this.editValue)
    this.$value.on('blur', this.editFieldStop.bind(this, 'value'))
    this.$value.on('keypress', this.editFieldKeyPressed.bind(this, 'value'))
    this.$value.on('keydown', this.editFieldTabPressed.bind(this, 'value'))
    this.$value.on('keydown', this.numericValueKeyDown)
    this.$insert.on('click', this.onInsertClick)
    this.$delete.on('click', this.onDeleteClick)
  }
  collapse = (recursive?: boolean) => {
    if (recursive) {
      each(this.children, (child) => child.collapse(true))
    }

    this.expanded = false

    this.$children.hide()
    this.$toggle.addClass(`${classPrefix}expand`)
    this.$toggle.rmClass(`${classPrefix}collapse`)
    this.$container.addClass(`${classPrefix}collapsed`)
    this.$container.rmClass(`${classPrefix}expanded`)
  }
  expand = (recursive?: boolean) => {
    const { type, value, children } = this
    let _keys: any[]

    if (type === 'object') {
      _keys = keys(value)
    } else if (type === 'array') {
      _keys = map(value, (val, key) => key)
    } else {
      _keys = []
    }

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]

      if (!contain(_keys, child.name)) {
        children.splice(i, 1)
        this.removeChild(child)
      }
    }

    if (type != 'object' && type != 'array') {
      return this.collapse()
    }

    each(_keys, (key) => this.addChild(key, value[key]))

    if (recursive) {
      each(children, (child) => child.expand(true))
    }

    this.expanded = true
    this.$children.css('display', 'block')
    this.$toggle.addClass(`${classPrefix}collapse`)
    this.$toggle.rmClass(`${classPrefix}expand`)
    this.$container.addClass(`${classPrefix}expanded`)
    this.$container.rmClass(`${classPrefix}collapsed`)
  }
  destroy() {
    const { children } = this
    let child

    while ((child = children.pop())) {
      this.removeChild(child)
    }

    this.$container.remove()
  }
  setName(newName: any) {
    let nameType = typeof newName
    let oldName = this.name

    if (newName === this.name) {
      return
    }

    if (nameType != 'string' && nameType != 'number') {
      throw new Error('Name must be either string or number, ' + newName)
    }

    this.$name.text(newName)
    this.name = newName
    this.emit('rename', this, oldName, newName)
  }
  setValue(newValue: any) {
    let oldValue = this.value
    let str

    this.type = getType(newValue)

    switch (this.type) {
      case 'null':
        str = 'null'
        break
      case 'object':
        str = 'Object'
        break
      case 'array':
        str = 'Array(' + newValue.length + ')'
        break
      default:
        str = newValue
        break
    }
    this.$value.text(str)
    this.$value.attr('class', `${classPrefix}value ${classPrefix + this.type}`)

    if (newValue === this.value) {
      return
    }

    this.value = newValue

    if (this.type == 'array' || this.type == 'object') {
      this.valueEditable = false
      if (this.type == 'array') {
        this.nameEditable = false
      }
    }

    this.refresh()
    this.emit('change', name, oldValue, newValue)
  }
  addChild = (key: any, val: any) => {
    const { children } = this
    let child

    for (let i = 0, len = children.length; i < len; i++) {
      if (children[i].name == key) {
        child = children[i]
        break
      }
    }

    if (child) {
      child.setValue(val)
    } else {
      const container = h('div')
      child = new JsonEditor(container, {
        name: key,
        value: val,
      })
      child.once('rename', this.onChildRename)
      child.on('delete', this.onChildDelete)
      child.on('change', this.onChildChange)
      children.push(child)
      this.$children.get(0).appendChild(container)
    }

    return child
  }
  removeChild = (child: JsonEditor) => {
    child.destroy()
  }
  editName = () => {
    this.editField('name')
  }
  editValue = () => {
    this.editField('value')
  }
  private editField = (field: any) => {
    const editable = field == 'name' ? this.nameEditable : this.valueEditable
    if (!editable) {
      return
    }
    let $el = this.$name

    if (field == 'name') {
      this.edittingName = true
    }

    if (field == 'value') {
      $el = this.$value
      this.edittingValue = true
    }

    $el.addClass(`${classPrefix}edit`)
    $el.attr('contenteditable', 'true')
    ;($el.get(0) as any).focus()
    document.execCommand('selectAll', false, undefined)
  }
  private editFieldStop = (field: any) => {
    let $el = this.$name

    if (field == 'name') {
      if (!this.edittingName) {
        return
      }
      this.edittingName = false
    }

    if (field == 'value') {
      if (!this.edittingValue) {
        return
      }
      $el = this.$value
      this.edittingValue = false
    }

    if (field == 'name') {
      this.setName($el.text())
    } else {
      try {
        this.setValue(JSON.parse($el.text()))
      } catch (err) {
        this.setValue($el.text())
      }
    }

    $el.rmClass(`${classPrefix}edit`)
    $el.rmAttr('contenteditable')
  }
  private editFieldKeyPressed = (field: any, e: any) => {
    e = e.origEvent
    switch (e.key) {
      case 'Escape':
      case 'Enter':
        this.editFieldStop(field)
        break
    }
  }
  private editFieldTabPressed(field: any, e: any) {
    e = e.origEvent
    if (e.key == 'Tab') {
      this.editFieldStop(field)
      if (field == 'name') {
        e.preventDefault()
        this.editField('value')
      } else {
        this.editFieldStop(field)
      }
    }
  }
  private numericValueKeyDown = (e: any) => {
    let increment = 0
    let currentValue

    if (this.type != 'number') {
      return
    }

    e = e.origEvent
    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        increment = -1
        break
      case 'ArrowUp':
      case 'Up':
        increment = 1
        break
    }

    if (e.shiftKey) {
      increment *= 10
    }

    if (e.ctrlKey || e.metaKey) {
      increment /= 10
    }

    if (increment) {
      currentValue = parseFloat(this.$value.text())

      if (!isNaN(currentValue)) {
        this.setValue(Number((currentValue + increment).toFixed(10)))
      }
    }
  }
  private onToggleClick = () => {
    if (this.expanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }
  private onInsertClick = () => {
    const newName = this.type == 'array' ? this.value.length : undefined
    const child = this.addChild(newName, null)

    if (this.type == 'array') {
      this.value.push(null)
      child.editValue()
    } else {
      child.editName()
    }
  }
  private onDeleteClick = () => {
    this.emit('delete', this)
  }
  private onChildRename = (child: JsonEditor, oldName: any, newName: any) => {
    const allow = newName && this.type != 'array' && !has(this.value, newName)

    if (allow) {
      this.value[newName] = child.value
      delete this.value[oldName]
    } else if (oldName === undefined) {
      this.removeChild(child)
    } else {
      child.name = oldName
    }

    child.once('rename', this.onChildRename)
  }
  private onChildChange = (
    keyPath: any,
    oldValue: any,
    newValue: any,
    recursed: any
  ) => {
    if (!recursed) {
      this.value[keyPath] = newValue
    }

    this.emit('change', this.name + '.' + keyPath, oldValue, newValue, true)
  }
  private onChildDelete = (child: JsonEditor) => {
    const key = child.name

    if (this.type == 'array') {
      this.value.splice(key, 1)
    } else {
      delete this.value[key]
    }

    this.refresh()
  }
  refresh = () => {
    const expandable = this.type == 'object' || this.type == 'array'

    each(this.children, (child) => child.refresh())

    this.$toggle.css('display', expandable ? 'inline-block' : 'none')

    if (this.expanded && expandable) {
      this.expand()
    } else {
      this.collapse()
    }
  }
}

function getType(value: any) {
  if (isNull(value)) {
    return 'null'
  }

  if (isArr(value)) {
    return 'array'
  }

  return typeof value
}
