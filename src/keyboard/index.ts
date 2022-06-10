import Component, { IComponentOptions } from '../share/Component'

/** IOptions */
export interface IOptions extends IComponentOptions {}

/**
 * Virtual keyboard.
 */
export default class Keyboard extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'keyboard' })

    this.initOptions(options, {})
  }
}

module.exports = Keyboard
module.exports.default = Keyboard
