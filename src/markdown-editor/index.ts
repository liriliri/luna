import Component from '../share/Component'

export default class MarkdownEditor extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'markdown-editor' })
  }
}

module.exports = MarkdownEditor
module.exports.default = MarkdownEditor
