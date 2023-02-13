import { exportCjs } from '../share/util'
import Component from '../share/Component'

/**
 * Lightweight tags input.
 */
export default class TagInput extends Component {
  constructor(container: HTMLInputElement) {
    super(container, { compName: 'tag-input' })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, TagInput)
}
