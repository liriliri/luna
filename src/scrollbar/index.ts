import { IOptions } from 'dist/carousel/cjs/carousel'
import Component from '../share/Component'

/**
 * Custom scrollbar.
 */
export default class Scrollbar extends Component<IOptions> {
  constructor(container: HTMLElement) {
    super(container, { compName: 'scrollbar' })
  }
}

module.exports = Scrollbar
module.exports.default = Scrollbar
