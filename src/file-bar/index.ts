import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * File explorer address bar.
 */
export default class FileBar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'file-bar ' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileBar)
}
