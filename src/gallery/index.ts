import Component from '../share/Component'

class Gallery extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'gallery' })
  }
}

module.exports = Gallery
module.exports.default = Gallery
