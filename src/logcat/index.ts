import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Android logcat viewer.
 */
export default class Logcat extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'logcat' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Logcat)
}
