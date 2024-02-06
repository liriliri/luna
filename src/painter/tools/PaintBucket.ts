import Tool from './Tool'
import Painter from '../'

export default class PaintBucket extends Tool {
  constructor(painter: Painter) {
    super(painter)

    this.options = {
      tolerance: 0,
    }
  }
  protected renderToolbar() {
    super.renderToolbar()

    const { toolbar, options } = this

    toolbar.appendText('Tolerance:')
    toolbar.appendNumber('tolerance', options.tolerance, {
      min: 0,
      max: 255,
      step: 1,
    })
  }
}
