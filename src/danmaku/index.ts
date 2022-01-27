import Component from '../share/Component'

export default class Danmaku extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'danmaku' })
  }
}

module.exports = Danmaku
module.exports.default = Danmaku
