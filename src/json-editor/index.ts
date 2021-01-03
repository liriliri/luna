import $ from 'licia/$'
import h from 'licia/h'
import each from 'licia/each'
import isNull from 'licia/isNull'
import isArr from 'licia/isArr'
import map from 'licia/map'
import keys from 'licia/keys'
import contain from 'licia/contain'
import has from 'licia/has'
import trim from 'licia/trim'
import toStr from 'licia/toStr'
import Component from '../share/Component'

// https://github.com/richard-livingston/json-view
export = class JsonEditor extends Component {
  private name: any
  private value: any
  private $name: $.$
  private $separator: $.$
  private $toggle: $.$
  private $value: $.$
  private $delete: $.$
  private $children: $.$
  private $insert: $.$
  private type = 'unknown'
  private children: JsonEditor[] = []
  private parent: JsonEditor | null = null
  private expanded = false
  private edittingName = false
  private edittingValue = false
  private nameEditable = true
  private valueEditable = true
  private enableInsert = true
  private enableDelete = true
  constructor(
    container: Element,
    {
      name,
      value = null,
      showName = true,
      nameEditable = true,
      valueEditable = true,
      parent = null,
      enableDelete = true,
      enableInsert = true,
    }: {
      name?: any
      value?: any
      showName?: boolean
      nameEditable?: boolean
      valueEditable?: boolean
      parent?: JsonEditor | null
      enableDelete?: boolean
      enableInsert?: boolean
    } = {}
  ) {
    super(container, { compName: 'json-editor' })

    this.initTpl()

    this.$toggle = this.find('.toggle')
    this.$name = this.find('.name')
    this.$separator = this.find('.separator')
    this.$value = this.find('.value')
    this.$delete = this.find('.delete')
    this.$children = this.find('.children')
    this.$insert = this.find('.insert')

    if (!showName) {
      this.$name.hide()
      this.$separator.hide()
    }

    if (!enableDelete) {
      this.$delete.hide()
    }

    if (!enableInsert) {
      this.$insert.hide()
    }

    this.nameEditable = nameEditable
    this.valueEditable = valueEditable
    this.parent = parent
    this.enableInsert = enableInsert
    this.enableDelete = enableDelete

    this.bindEvent()

    this.setName(name)
    this.setValue(value)
  }
  initTpl() {
    this.$container.html(
      this.c(
        [
          '<div class="toggle"><span class="icon icon-arrow-right"></span><span class="icon icon-arrow-down"></span></div>',
          '<div class="name"></div>',
          '<div class="separator"></div>',
          '<div class="value"></div>',
          '<div class="delete"><span class="icon icon-delete"></span></div>',
          '<div class="children"></div>',
          '<div class="insert"><span class="icon icon-add"></span></div>',
        ].join('')
      )
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
    const { c } = this
    if (recursive) {
      each(this.children, (child) => child.collapse(true))
    }

    this.expanded = false

    this.$children.hide()
    this.$toggle.addClass(c('expand'))
    this.$toggle.rmClass(`${c('collapse')}`)
    this.$container.addClass(`${c('collapsed')}`)
    this.$container.rmClass(`${c('expanded')}`)
  }
  expand = (recursive?: boolean) => {
    const { type, value, children, c } = this
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

      if (!contain(_keys, child.getName())) {
        children.splice(i, 1)
        this.removeChild(child)
      }
    }

    if (type !== 'object' && type !== 'array') {
      return this.collapse()
    }

    each(_keys, (key) => this.addChild(key, value[key]))

    if (recursive) {
      each(children, (child) => child.expand(true))
    }

    this.expanded = true
    this.$children.css('display', 'block')
    this.$toggle.addClass(c('collapse'))
    this.$toggle.rmClass(c('expand'))
    this.$container.addClass(c('expanded'))
    this.$container.rmClass(c('collapsed'))
  }
  destroy() {
    const { children } = this
    let child = children.pop()

    while (child) {
      this.removeChild(child)
      child = children.pop()
    }

    this.$container.remove()
  }
  getName() {
    return this.name
  }
  setName(newName: any) {
    const nameType = typeof newName
    const oldName = this.name

    if (newName === this.name) {
      return
    }

    if (nameType !== 'string' && nameType !== 'number') {
      throw new Error('Name must be either string or number, ' + newName)
    }

    this.$name.text(trim(toStr(newName)) === '' ? `"${newName}"` : newName)
    this.name = newName
    this.emit('rename', this, oldName, newName)
  }
  getValue() {
    return this.value
  }
  setValue(newValue: any) {
    const oldValue = this.value
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
    this.$value.attr('class', this.c(`value ${this.type}`))

    if (newValue === this.value) {
      return
    }

    this.value = newValue

    this.refresh()
    this.emit('change', this.name, oldValue, newValue)
  }
  addChild = (key: any, val: any) => {
    const { children } = this
    let child

    for (let i = 0, len = children.length; i < len; i++) {
      if (children[i].getName() === key) {
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
        parent: this,
        nameEditable: this.nameEditable,
        valueEditable: this.valueEditable,
        enableDelete: this.enableDelete,
        enableInsert: this.enableInsert,
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
  getType() {
    return this.type
  }
  editName = () => {
    this.editField('name')
  }
  editValue = () => {
    this.editField('value')
  }
  private isNameEditable() {
    if (!this.nameEditable) {
      return false
    }

    return !(this.parent && this.parent.getType() === 'array')
  }
  private isValueEditable() {
    if (!this.valueEditable) {
      return false
    }

    return this.type !== 'array' && this.type !== 'object'
  }
  private editField = (field: any) => {
    const editable =
      field === 'name' ? this.isNameEditable() : this.isValueEditable()
    if (!editable) {
      return
    }
    let $el = this.$name

    if (field === 'name') {
      this.edittingName = true
    }

    if (field === 'value') {
      $el = this.$value
      this.edittingValue = true
    }

    $el.addClass(this.c('edit'))
    $el.attr('contenteditable', 'true')
    ;($el.get(0) as any).focus()
    document.execCommand('selectAll', false, undefined)
  }
  private editFieldStop = (field: any) => {
    let $el = this.$name

    if (field === 'name') {
      if (!this.edittingName) {
        return
      }
      this.edittingName = false
    }

    if (field === 'value') {
      if (!this.edittingValue) {
        return
      }
      $el = this.$value
      this.edittingValue = false
    }

    if (field === 'name') {
      this.setName($el.text())
    } else {
      try {
        this.setValue(JSON.parse($el.text()))
      } catch (err) {
        this.setValue($el.text())
      }
    }

    $el.rmClass(this.c('edit'))
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
    if (e.key === 'Tab') {
      this.editFieldStop(field)
      if (field === 'name') {
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

    if (this.type !== 'number') {
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
    const newName = this.type === 'array' ? this.value.length : undefined
    const child = this.addChild(newName, null)

    if (this.type === 'array') {
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
    const allow = newName && this.type !== 'array' && !has(this.value, newName)

    if (allow) {
      this.value[newName] = child.getValue()
      delete this.value[oldName]
    } else if (oldName === undefined) {
      this.removeChild(child)
    } else {
      child.setName(oldName)
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
    const key = child.getName()

    if (this.type === 'array') {
      this.value.splice(key, 1)
    } else {
      delete this.value[key]
    }

    this.refresh()
  }
  refresh = () => {
    const expandable = this.type === 'object' || this.type === 'array'

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
