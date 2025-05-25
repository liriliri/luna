import { exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Number of inputs. */
  inputNum?: number
}

/**
 * One time password input.
 */
export default class OtpInput extends Component<IOptions> {
  constructor(container: HTMLInputElement, options: IOptions = {}) {
    super(container, { compName: 'otp-input' }, options)

    this.initOptions(options, {
      inputNum: 6,
    })

    this.initTpl()
    this.bindEvent()
  }
  private initTpl() {
    const { inputNum } = this.options

    let html = ''
    for (let i = 0; i < inputNum; i++) {
      html += '<input type="text"></input>'
    }

    this.$container.html(html)
  }
  private bindEvent() {
    this.$container.on('input', 'change', (e: any) => {
      console.log('change')
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, OtpInput)
}
