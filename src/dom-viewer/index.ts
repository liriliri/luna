import Component from '../share/Component'

export default class DomViewer extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'dom-viewer' })
  }
}

module.exports = DomViewer
module.exports.default = DomViewer
