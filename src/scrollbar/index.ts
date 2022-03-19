import Component from '../share/Component'

/**
 * Custom scrollbar.
 */
export default class Scrollbar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'scrollbar' })
  }
}

module.exports = Scrollbar
module.exports.default = Scrollbar
