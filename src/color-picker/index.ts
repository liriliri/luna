import $ from 'licia/$'
import Component from '../share/Component'

export default class ColorPicker extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'color-picker' })
    this.$container = $(container)
  }
}

module.exports = ColorPicker
module.exports.default = ColorPicker
