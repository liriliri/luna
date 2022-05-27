import Component from '../share/Component'

/**
 * Retro emulator with controls ui.
 */
export default class RetroHandheld extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'retro-handheld' })
  }
}

module.exports = RetroHandheld
module.exports.default = RetroHandheld
