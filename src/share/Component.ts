import Emitter from 'licia/Emitter'
import $ from 'licia/$'
import { classPrefix, getPlatform } from './util'
import each from 'licia/each'
import extend from 'licia/extend'
import defaults from 'licia/defaults'
import remove from 'licia/remove'
import theme from 'licia/theme'
import startWith from 'licia/startWith'

interface IOptions {
  compName: string
}

export interface IComponentOptions {
  theme?: string
}

export default class Component<
  Options extends IComponentOptions = any
> extends Emitter {
  c: (name: string) => string
  container: HTMLElement
  $container: $.$
  private subComponents: Component[] = []
  private compName: string
  private theme = ''
  protected options: Required<Options>
  constructor(
    container: Element,
    { compName }: IOptions,
    { theme: t = 'light' }: IComponentOptions = {}
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

    this.on('changeOption', (name, val) => {
      if (name === 'theme' && val) {
        let t = val
        if (val === 'auto') {
          t = theme.get()
        }
        this.setTheme(t)
        each(this.subComponents, (component) =>
          component.setOption('theme', val)
        )
      }
    })

    theme.on('change', this.onThemeChange)

    this.setOption('theme', t)
  }
  destroy() {
    this.destroySubComponents()
    const { $container } = this
    const classes = $container.attr('class')
    each(classes.split(/\s+/), (c) => {
      if (startWith(c, `luna-${this.compName}`)) {
        $container.rmClass(c)
      }
    })
    $container.html('')
    this.emit('destroy')
    this.removeAllListeners()
    theme.off('change', this.onThemeChange)
  }
  setOption(name: string | Partial<Options>, val?: any) {
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
      if (val === oldVal) {
        return
      }
      this.emit('changeOption', name, val, oldVal)
    })
  }
  getOption(name: string) {
    return (this.options as any)[name]
  }
  addSubComponent(component: Component) {
    component.setOption('theme', this.options.theme)
    this.subComponents.push(component)
  }
  removeSubComponent(component: Component) {
    remove(this.subComponents, (com) => com === component)
  }
  destroySubComponents() {
    each(this.subComponents, (component) => component.destroy())
    this.subComponents = []
  }
  protected initOptions(options: Options, defs: any = {}) {
    defaults(options, defs)
    extend(this.options, options)
  }
  protected find(selector: string) {
    return this.$container.find(this.c(selector))
  }
  private setTheme(theme: string) {
    const { c, $container } = this

    if (this.theme) {
      $container.rmClass(c(`theme-${this.theme}`))
    }

    $container.addClass(c(`theme-${theme}`))
    this.theme = theme
  }
  private onThemeChange = (t: string) => {
    if (this.options.theme === 'auto') {
      this.setTheme(t)
    }
  }
}
