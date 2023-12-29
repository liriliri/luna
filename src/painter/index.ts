import Component, { IComponentOptions } from '../share/Component'

export interface IOptions extends IComponentOptions {
  width?: number
  height?: number
}

/**
 * Simple drawing tool.
 *
 * @example
 * const container = document.getElementById('container')
 * const painer = new LunaPainter(container)
 */
export default class Painter extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'painer' }, options)

    this.initOptions(options, {})
  }
}
