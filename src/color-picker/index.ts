import $ from 'licia/$'
import Component from '../share/Component'

export = class ColorPicker extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'color-picker' })
    this.$container = $(container)
  }
}
