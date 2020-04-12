import $ from 'licia/$'
import './style.scss'

module.exports = class ColorPicker {
  private $container: $.$
  constructor(container: Element) {
    this.$container = $(container)
  }
}
