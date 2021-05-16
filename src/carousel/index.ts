import Component from '../share/Component'

export default class Carousel extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'carousel' })
  }
}

module.exports = Carousel
module.exports.default = Carousel
