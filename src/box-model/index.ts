import { exportCjs } from '../share/util'
import Component from '../share/Component'

/**
 * Css box model metrics.
 */
export default class BoxModel extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'box-model' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, BoxModel)
}
