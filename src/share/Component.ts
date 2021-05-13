import Emitter from 'licia/Emitter'
import $ from 'licia/$'
import { classPrefix } from './util'

interface IOptions {
  compName: string
}

export default class Component extends Emitter {
  c: (name: string) => string
  container: HTMLElement
  $container: $.$
  private compName: string
  constructor(container: Element, { compName }: IOptions) {
    super()
    this.compName = compName
    this.c = classPrefix(compName)

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
  protected find(selector: string) {
    return this.$container.find(this.c(selector))
  }
}
