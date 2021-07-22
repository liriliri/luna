import Emitter from 'licia/Emitter'
import $ from 'licia/$'
import { classPrefix } from './util'
import each from 'licia/each'

interface IOptions {
  compName: string
}

export default class Component<Options = any> extends Emitter {
  c: (name: string) => string
  container: HTMLElement
  $container: $.$
  private compName: string
  protected options: Options
  constructor(container: Element, { compName }: IOptions) {
    super()
    this.compName = compName
    this.c = classPrefix(compName)
    this.options = {} as Options

    this.container = container as HTMLElement
    this.$container = $(container)
    this.$container.addClass(`luna-${compName}`)
  }
  destroy() {
    this.$container.rmClass(`luna-${this.compName}`)
    this.$container.html('')
    this.emit('destroy')
    this.removeAllListeners()
  }
  setOption(options: Options): void
  setOption(name: string | Options, val?: any) {
    const options: any = this.options
    let newOptions: any = {}
    if (typeof name === 'string') {
      newOptions[name] = val
    } else {
      newOptions = name
    }
    each(newOptions, (val, name: string) => {
      const oldVal = options[name]
      options[name] = val
      this.emit('optionChange', name, val, oldVal)
    })
  }
  protected find(selector: string) {
    return this.$container.find(this.c(selector))
  }
}
