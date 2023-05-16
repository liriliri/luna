import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Application toolbar.
 */
export default class Toolbar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'toolbar' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Toolbar)
}
