import $ from 'licia/$'
import './style.scss'

export = class ColorPicker {
  private $container: $.$
  constructor(container: Element) {
    this.$container = $(container)

    this.initTpl()
  }
  private initTpl() {
    const { $container } = this
    $container.html('')
  }
}
