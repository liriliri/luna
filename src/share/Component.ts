import Emitter from 'licia/Emitter'
import $ from 'licia/$'
import { classPrefix, getPlatform } from './util'
import each from 'licia/each'
import extend from 'licia/extend'
import defaults from 'licia/defaults'

interface IOptions {
  compName: string
}

export interface IComponentOptions {
  theme?: string
}

export default class Component<Options = any> extends Emitter {
  c: (name: string) => string
  container: HTMLElement
  $container: $.$
  private compName: string
  protected options: Required<Options>
  constructor(
    container: Element,
    { compName }: IOptions,
    { theme = 'light' }: IComponentOptions = {}
  ) {
    super()
    this.compName = compName
    this.c = classPrefix(compName)
    this.options = {} as Required<Options>

    this.container = container as HTMLElement
    this.$container = $(container)
    this.$container.addClass([
      `luna-${compName}`,
      this.c(`platform-${getPlatform()}`),
    ])

    this.on('optionChange', (name, val, oldVal) => {
      const c = this.c
      if (name === 'theme') {
        this.$container
          .rmClass(c(`theme-${oldVal}`))
          .addClass(c(`theme-${val}`))
      }
    })

    this.setOption('theme', theme)
  }
  destroy() {
    const { c } = this
    this.$container
      .rmClass(`luna-${this.compName}`)
      .rmClass(c(`platform-${getPlatform()}`))
      .rmClass(c(`theme-${(this.options as any).theme}`))
    this.$container.html('')
    this.emit('destroy')
    this.removeAllListeners()
  }
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
  getOption(name: string) {
    return (this.options as any)[name]
  }
  protected initOptions(options: Options, defs: any = {}) {
    defaults(options, defs)
    extend(this.options, options)
  }
  protected find(selector: string) {
    return this.$container.find(this.c(selector))
  }
}
