import Component from '../share/Component'

/**
 * Syntax highlighter using highlightjs.
 */
export default class SyntaxHighlighter extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'syntax-highlighter' })
  }
}

module.exports = SyntaxHighlighter
module.exports.default = SyntaxHighlighter
