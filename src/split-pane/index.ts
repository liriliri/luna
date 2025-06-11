import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
interface IOptions extends IComponentOptions {
  /** Direction to split. */
  direction?: 'horizontal' | 'vertical'
}

/**
 * A component for creating resizable split panes.
 *
 * @example
 * const splitPane = new SplitPane(container, {})
 */
export default class SplitPane extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'split-pane' }, options)

    this.initTpl()
    this.bindEvent()
  }

  private initTpl() {
    this.$container.html(this.c('<div class="split-pane"></div>'))
  }

  private bindEvent() {
    // Add event listeners for split pane functionality
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, SplitPane)
}
