import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Play lyrics in LRC format.
 */
export default class LrcPlayer extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'lrc-player' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, LrcPlayer)
}
