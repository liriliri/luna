import Component from '../share/Component'

export default class MenuBar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'menu-bar' })
  }
}

module.exports = MenuBar
module.exports.default = MenuBar
