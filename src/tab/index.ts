import Component from '../share/Component'

/**
 * Easy tabs.
 */
export default class Tab extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'tab' })
  }
}

module.exports = Tab
module.exports.default = Tab
