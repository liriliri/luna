import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Show list of icons and their names.
 *
 * @example
 * const iconList = new LunaIconList(container)
 */
export default class IconList extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'icon-list' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, IconList)
}
