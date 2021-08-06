import Component from '../share/Component'

class Modal extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'modal' })
  }
}

module.exports = Modal
module.exports.default = Modal
