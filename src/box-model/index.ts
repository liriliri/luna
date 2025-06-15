import map from 'licia/map'
import isNum from 'licia/isNum'
import isStr from 'licia/isStr'
import bind from 'licia/bind'
import $ from 'licia/$'
import { exportCjs, pxToNum } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Target element. */
  element?: HTMLElement
}

/**
 * Css box model metrics.
 *
 * @example
 * const boxModel = new LunaBoxModel(container)
 * boxModel.setOption('element', document.getElementById('target'))
 */
export default class BoxModel extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'box-model' })

    this.initOptions(options)

    if (this.options.element) {
      this.render()
    }

    this.bindEvent()
  }
  private bindEvent() {
    this.on('changeOption', (name) => {
      switch (name) {
        case 'element':
          this.render()
          break
      }
    })
  }
  private render() {
    const { c, $container } = this
    const boxModel = this.getBoxModelData()

    // prettier-ignore
    $container.html([boxModel.position ? `<div class="${c('position')}">` : '',
      boxModel.position ? `<div class="${c('label')}">position</div><div class="${c('top')}">${boxModel.position.top}</div><br><div class="${c('left')}">${boxModel.position.left}</div>` : '',
      `<div class="${c('margin')}">`,
        `<div class="${c('label')}">margin</div><div class="${c('top')}">${boxModel.margin.top}</div><br><div class="${c('left')}">${boxModel.margin.left}</div>`,
        `<div class="${c('border')}">`,
          `<div class="${c('label')}">border</div><div class="${c('top')}">${boxModel.border.top}</div><br><div class="${c('left')}">${boxModel.border.left}</div>`,
          `<div class="${c('padding')}">`,
            `<div class="${c('label')}">padding</div><div class="${c('top')}">${boxModel.padding.top}</div><br><div class="${c('left')}">${boxModel.padding.left}</div>`,
            `<div class="${c('content')}">`,
              `<span>${boxModel.content.width}</span>&nbsp;×&nbsp;<span>${boxModel.content.height}</span>`,
            '</div>',
            `<div class="${c('right')}">${boxModel.padding.right}</div><br><div class="${c('bottom')}">${boxModel.padding.bottom}</div>`,
          '</div>',
          `<div class="${c('right')}">${boxModel.border.right}</div><br><div class="${c('bottom')}">${boxModel.border.bottom}</div>`,
        '</div>',
        `<div class="${c('right')}">${boxModel.margin.right}</div><br><div class="${c('bottom')}">${boxModel.margin.bottom}</div>`,
      '</div>',
      boxModel.position ? `<div class="${c('right')}">${boxModel.position.right}</div><br><div class="${c('bottom')}">${boxModel.position.bottom}</div>` : '',
    boxModel.position ? '</div>' : ''].join(''))

    const $margin = this.find('.margin')
    const $border = this.find('.border')
    const $padding = this.find('.padding')
    const $content = this.find('.content')

    const highlightAll = () => {
      $margin.addClass(c('highlighted'))
      $border.addClass(c('highlighted'))
      $padding.addClass(c('highlighted'))
      $content.addClass(c('highlighted'))
    }
    highlightAll()

    const highlight = (type: string) => {
      this.find(`.highlighted`).rmClass(c('highlighted'))
      let $el: $.$
      switch (type) {
        case 'margin':
          $el = $margin
          break
        case 'border':
          $el = $border
          break
        case 'padding':
          $el = $padding
          break
        default:
          $el = $content
          break
      }
      $el.addClass(c('highlighted'))
      this.emit('highlight', type)
    }

    const highlightMargin = bind(highlight, this, 'margin')
    const highlightBorder = bind(highlight, this, 'border')
    const highlightPadding = bind(highlight, this, 'padding')
    const highlightContent = bind(highlight, this, 'content')

    $margin.on('mouseenter', highlightMargin).on('mouseleave', () => {
      highlightAll()
      this.emit('highlight', 'all')
    })
    $border.on('mouseenter', highlightBorder).on('mouseleave', highlightMargin)
    $padding
      .on('mouseenter', highlightPadding)
      .on('mouseleave', highlightBorder)
    $content
      .on('mouseenter', highlightContent)
      .on('mouseleave', highlightPadding)
  }
  private getBoxModelData() {
    const { element } = this.options
    const computedStyle = window.getComputedStyle(element)

    function getBoxModelValue(type: string) {
      let keys = ['top', 'left', 'right', 'bottom']
      if (type !== 'position') {
        keys = map(keys, (key) => `${type}-${key}`)
      }
      if (type === 'border') {
        keys = map(keys, (key) => `${key}-width`)
      }

      return {
        top: boxModelValue(computedStyle[keys[0] as any], type),
        left: boxModelValue(computedStyle[keys[1] as any], type),
        right: boxModelValue(computedStyle[keys[2] as any], type),
        bottom: boxModelValue(computedStyle[keys[3] as any], type),
      }
    }

    const boxModel: any = {
      margin: getBoxModelValue('margin'),
      border: getBoxModelValue('border'),
      padding: getBoxModelValue('padding'),
      content: getContentSize(element),
    }

    if (computedStyle['position'] !== 'static') {
      boxModel.position = getBoxModelValue('position')
    }

    return boxModel
  }
}

function boxModelValue(val: any, type?: string) {
  if (isNum(val)) return val

  if (!isStr(val)) return '‒'

  const ret = pxToNum(val)
  if (isNaN(ret)) return val

  if (type === 'position') return ret

  return ret === 0 ? '‒' : ret
}

if (typeof module !== 'undefined') {
  exportCjs(module, BoxModel)
}

export function getContentSize(el: HTMLElement) {
  const style = window.getComputedStyle(el)

  const paddingWidth = pxToNum(style.paddingLeft) + pxToNum(style.paddingRight)
  const paddingHeight = pxToNum(style.paddingTop) + pxToNum(style.paddingBottom)

  const borderWidth =
    pxToNum(style.borderLeftWidth) + pxToNum(style.borderRightWidth)
  const borderHeight =
    pxToNum(style.borderTopWidth) + pxToNum(style.borderBottomWidth)

  return {
    width: boxModelValue(el.offsetWidth - paddingWidth - borderWidth),
    height: boxModelValue(el.offsetHeight - paddingHeight - borderHeight),
  }
}
