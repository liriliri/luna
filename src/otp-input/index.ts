import { exportCjs } from '../share/util'
import Component from '../share/Component'

/**
 * One time password input.
 */
export default class OtpInput extends Component {
  constructor(container: HTMLInputElement) {
    super(container, { compName: 'otp-input' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, OtpInput)
}
