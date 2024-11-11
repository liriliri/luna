import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * List files in the directory.
 */
export default class FileList extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'file-list' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
