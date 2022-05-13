import Component from '../share/Component'

/**
 * Nintendo Famicom emulator using FCEUmm.
 */
export default class FcEmulator extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'fc-emulator' })
  }
}

module.exports = FcEmulator
module.exports.default = FcEmulator
