import { exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'

/**
 * Drag selector for selecting multiple items.
 */
export default class DragSelector extends Component<IComponentOptions> {
  constructor(container: HTMLElement, options: IComponentOptions = {}) {
    super(container, { compName: 'drag-selector' }, options)

    this.bindEvent()
  }
  private bindEvent() {
    // ignore
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, DragSelector)
}
