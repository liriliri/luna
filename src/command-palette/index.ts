import Component from '../share/Component'

class CommandPalette extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'command-palette' })
  }
}

module.exports = CommandPalette
module.exports.default = CommandPalette
