import normalizePath from 'licia/normalizePath'
import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import $ from 'licia/$'
import trim from 'licia/trim'
import each from 'licia/each'
import escape from 'licia/escape'
import toEl from 'licia/toEl'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** File path. */
  path: string
}

/**
 * File explorer path bar.
 *
 * @example
 * const pathBar = new LunaPathBar(container, { path: '/home/user' })
 * pathBar.setOption('path', '/home/user/documents')
 * pathBar.on('change', (path) => {
 *   console.log('Path changed:', path)
 * })
 */
export default class PathBar extends Component {
  private $address: $.$
  private address: HTMLElement
  private $input: $.$
  private input: HTMLInputElement
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'path-bar' }, options)

    this.initOptions(options, {})

    this.initTpl()

    this.$address = this.find('.address')
    this.address = this.$address.get(0) as HTMLElement
    this.$input = this.find('.input')
    this.input = this.$input.get(0) as HTMLInputElement

    this.bindEvent()
    this.render()
  }
  private render() {
    const { c } = this
    const path = trim(normalizePath(this.options.path), '/')

    const paths: string[] = []
    this.$address.html('')
    each(path.split('/'), (part) => {
      paths.push(part)
      const el = toEl(
        `<div class="${c('item')}">${escape(part)}<span class="${c(
          'icon-right'
        )}"></span></div>`
      )
      el.setAttribute('data-path', paths.join('/'))
      this.$address.append(el)
    })

    this.$input.val(this.options.path)
  }
  private initTpl() {
    this.$container.html(
      this.c(`
      <div class="address"></div>
      <input type="text" name="path" class="input"></input>`)
    )
  }
  private bindEvent() {
    const { $input, c, address } = this

    const self = this
    this.$address
      .on('click', () => {
        this.$input.show()
        this.$address.hide()
        this.input.focus()
      })
      .on('click', c('.item'), function (this: HTMLElement, e) {
        const $this = $(this)
        e.stopPropagation()
        self.onChange($this.data('path'))
      })
      .on('wheel', function (e) {
        e.preventDefault()
        address.scrollLeft += e.origEvent.deltaY
      })

    $input
      .on('blur', () => {
        this.onChange(trim($input.val()))
      })
      .on('keydown', (e) => {
        if (e.origEvent.key === 'Enter') {
          this.onChange(trim($input.val()))
        }
      })

    this.on('changeOption', (name) => {
      switch (name) {
        case 'path':
          this.render()
          break
      }
    })
  }
  private onChange(path: string) {
    const oldPath = this.options.path
    this.$input.hide()
    this.$address.show()
    if (path === oldPath) {
      return
    }
    this.setOption('path', path)
    this.emit('change', this.options.path)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, PathBar)
}
