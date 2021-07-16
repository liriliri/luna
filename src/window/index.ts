import Component from '../share/Component'
import h from 'licia/h'

export default class Window extends Component {
  constructor() {
    super(h('div'), { compName: 'window' })
  }
}

module.exports = Window
module.exports.default = Window
