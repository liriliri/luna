import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * File explorer path bar.
 */
export default class PathBar extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'path-bar ' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, PathBar)
}
