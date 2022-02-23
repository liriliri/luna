import Component from '../share/Component'

export default class MarkdownViewer extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'markdown-viewer' })
  }
}

module.exports = MarkdownViewer
module.exports.default = MarkdownViewer
