import Component from '../share/Component'
import { HighlightOverlay } from './overlay/tool_highlight'
import { pxToNum } from '../share/util'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import lowerCase from 'licia/lowerCase'
import each from 'licia/each'
import Color from 'licia/Color'
import hex from 'licia/hex'
import upperCase from 'licia/upperCase'
import extend from 'licia/extend'
import camelCase from 'licia/camelCase'
import contain from 'licia/contain'
import toNum from 'licia/toNum'
import elementRoles from './elementRoles'
import isStr from 'licia/isStr'

interface IRect {
  left: number
  top: number
  width: number
  height: number
}

interface IRgb {
  r: number
  g: number
  b: number
  a?: number
}

interface IOptions {
  showRulers?: boolean
  showExtensionLines?: boolean
  showInfo?: boolean
  showStyles?: boolean
  showAccessibilityInfo?: boolean
  colorFormat?: 'rgb' | 'hsl' | 'hex'
  contentColor?: string | IRgb
  paddingColor?: string | IRgb
  borderColor?: string | IRgb
  marginColor?: string | IRgb
  monitorResize?: boolean | IRgb
}

export default class DomHighlighter extends Component<Required<IOptions>> {
  private overlay: HighlightOverlay = new HighlightOverlay(window)
  private target: HTMLElement | Text | null
  private resizeSensor: ResizeSensor
  private redraw: () => void
  private interceptor: (...args: any[]) => any | null
  constructor(
    container: HTMLElement,
    {
      showRulers = false,
      showExtensionLines = false,
      showInfo = true,
      showStyles = true,
      showAccessibilityInfo = true,
      colorFormat = 'hex',
      contentColor = 'rgba(111, 168, 220, .66)',
      paddingColor = 'rgba(147, 196, 125, .55)',
      borderColor = 'rgba(255, 229, 153, .66)',
      marginColor = 'rgba(246, 178, 107, .66)',
      monitorResize = true,
    }: IOptions = {}
  ) {
    super(container, { compName: 'dom-highlighter' })

    this.options = {
      showRulers,
      showExtensionLines,
      showInfo,
      showStyles,
      showAccessibilityInfo,
      colorFormat,
      contentColor,
      paddingColor,
      borderColor,
      marginColor,
      monitorResize,
    }

    this.overlay.setContainer(container)
    this.overlay.setPlatform('mac')

    this.redraw = throttle(() => {
      this.reset()
      this.draw()
    }, 16)

    this.redraw()
    this.bindEvent()
  }
  highlight(target: HTMLElement | Text, options?: IOptions) {
    if (options) {
      extend(this.options, options)
    }
    this.target = target

    if (target instanceof HTMLElement && this.options.monitorResize) {
      if (this.resizeSensor) {
        this.resizeSensor.destroy()
      }
      this.resizeSensor = new ResizeSensor(target)
      this.resizeSensor.addListener(this.redraw)
    }

    this.redraw()
  }
  hide() {
    this.target = null
    this.redraw()
  }
  intercept(interceptor: (...args: any[]) => any | null) {
    this.interceptor = interceptor
  }
  destroy() {
    window.removeEventListener('resize', this.redraw)
    window.removeEventListener('scroll', this.redraw)
    if (this.resizeSensor) {
      this.resizeSensor.destroy()
    }

    super.destroy()
  }
  private draw() {
    const { target } = this
    if (!target) {
      return
    }

    if (target instanceof Text) {
      this.drawText(target)
    } else {
      this.drawElement(target)
    }
  }
  private drawText(target: Text) {
    const { options } = this
    const range = document.createRange()
    range.selectNode(target)
    const { left, top, width, height } = range.getBoundingClientRect()
    range.detach()

    const highlight: any = {
      paths: [
        {
          path: this.rectToPath({
            left,
            top,
            width,
            height,
          }),
          fillColor: normalizeColor(options.contentColor),
          name: 'content',
        },
      ],
      showExtensionLines: options.showExtensionLines,
      showRulers: options.showRulers,
    }

    if (options.showInfo) {
      highlight.elementInfo = {
        tagName: '#text',
        nodeWidth: width,
        nodeHeight: height,
      }
    }

    this.overlay.drawHighlight(highlight)
  }
  private drawElement(target: HTMLElement) {
    let highlight: any = {
      paths: this.getPaths(target),
      showExtensionLines: this.options.showExtensionLines,
      showRulers: this.options.showRulers,
      colorFormat: this.options.colorFormat,
    }

    if (this.options.showInfo) {
      highlight.elementInfo = this.getElementInfo(target)
    }

    if (this.interceptor) {
      const result = this.interceptor(highlight)
      if (result) {
        highlight = result
      }
    }
    this.overlay.drawHighlight(highlight)
  }
  private getPaths(target: HTMLElement) {
    const { options } = this
    const computedStyle = window.getComputedStyle(target)

    const { left, top, width, height } = target.getBoundingClientRect()

    const getNumStyle = (name: string) => {
      return pxToNum(computedStyle.getPropertyValue(name))
    }

    const ml = getNumStyle('margin-left')
    const mr = getNumStyle('margin-right')
    const mt = getNumStyle('margin-top')
    const mb = getNumStyle('margin-bottom')

    const bl = getNumStyle('border-left-width')
    const br = getNumStyle('border-right-width')
    const bt = getNumStyle('border-top-width')
    const bb = getNumStyle('border-bottom-width')

    const pl = getNumStyle('padding-left')
    const pr = getNumStyle('padding-right')
    const pt = getNumStyle('padding-top')
    const pb = getNumStyle('padding-bottom')

    const contentPath = {
      path: this.rectToPath({
        left: left + bl + pl,
        top: top + bt + pt,
        width: width - bl - pl - br - pr,
        height: height - bt - pt - bb - pb,
      }),
      fillColor: normalizeColor(options.contentColor),
      name: 'content',
    }

    const paddingPath = {
      path: this.rectToPath({
        left: left + bl,
        top: top + bt,
        width: width - bl - br,
        height: height - bt - bb,
      }),
      fillColor: normalizeColor(options.paddingColor),
      name: 'padding',
    }

    const borderPath = {
      path: this.rectToPath({
        left,
        top,
        width,
        height,
      }),
      fillColor: normalizeColor(options.borderColor),
      name: 'border',
    }

    const marginPath = {
      path: this.rectToPath({
        left: left - ml,
        top: top - mt,
        width: width + ml + mr,
        height: height + mt + mb,
      }),
      fillColor: normalizeColor(options.marginColor),
      name: 'margin',
    }

    return [contentPath, paddingPath, borderPath, marginPath]
  }
  private getElementInfo(target: HTMLElement) {
    const { width, height } = target.getBoundingClientRect()
    const className = target.className
      .split(/\s+/)
      .map((c) => '.' + c)
      .join('')

    const elementInfo: any = {
      tagName: lowerCase(target.tagName),
      className,
      idValue: target.id,
      nodeWidth: width,
      nodeHeight: height,
    }

    if (this.options.showStyles) {
      elementInfo.style = this.getStyles(target)
    }

    if (this.options.showAccessibilityInfo) {
      extend(elementInfo, this.getAccessibilityInfo(target))
    }

    return elementInfo
  }
  // third_party/blink/renderer/core/inspector/inspector_highlight.cc
  private getStyles(target: HTMLElement) {
    const computedStyle = window.getComputedStyle(target)
    let hasTextChildren = false
    const childNodes = target.childNodes
    for (let i = 0, len = childNodes.length; i < len; i++) {
      if (childNodes[i].nodeType === 3) {
        hasTextChildren = true
      }
    }

    const properties = []
    if (hasTextChildren) {
      properties.push('color', 'font-family', 'font-size', 'line-height')
    }
    properties.push('padding', 'margin', 'background-color')

    return propertiesToValues(computedStyle, properties)
  }
  private getAccessibilityInfo(target: HTMLElement) {
    const computedStyle: any = window.getComputedStyle(target)

    return {
      showAccessibilityInfo: true,
      contrast: {
        contrastAlgorithm: 'aa',
        textOpacity: 0.1,
        ...propertiesToValues(
          computedStyle,
          ['font-size', 'font-weight', 'background-color', 'text-opacity'],
          true
        ),
      },
      isKeyboardFocusable: this.isFocusable(target),
      ...this.getAccessibleNameAndRole(target),
    }
  }
  private isFocusable(target: HTMLElement) {
    const tagName = lowerCase(target.tagName)

    if (
      contain(
        ['a', 'button', 'input', 'textarea', 'select', 'details'],
        tagName
      )
    ) {
      return true
    }

    const tabIdx = target.getAttribute('tabindex')
    if (tabIdx && toNum(tabIdx) > -1) {
      return true
    }

    return false
  }
  private getAccessibleNameAndRole(target: HTMLElement) {
    const name =
      target.getAttribute('labelledby') || target.getAttribute('aria-label')

    let role = target.getAttribute('role')

    const tagName = lowerCase(target.tagName)
    elementRoles.forEach((value: any) => {
      if (role) {
        return
      }

      const name: string = value[0]
      const attributes: any = value[2]

      if (name !== tagName) {
        return
      }

      if (attributes) {
        for (const attribute of attributes) {
          if (target.getAttribute(attribute[0]) !== attribute[1]) {
            return
          }
        }
      }

      role = value[1]
    })

    return {
      accessibleName: name || target.getAttribute('title') || '',
      accessibleRole: role || 'generic',
    }
  }
  private bindEvent() {
    window.addEventListener('resize', this.redraw)
    window.addEventListener('scroll', this.redraw)

    this.on('optionChange', () => this.redraw())
  }
  private reset = () => {
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight

    this.overlay.reset({
      viewportSize: {
        width: viewportWidth,
        height: viewportHeight,
      },
      deviceScaleFactor: 1,
      pageScaleFactor: 1,
      pageZoomFactor: 1,
      emulationScaleFactor: 1,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    })
  }
  private rectToPath({ left, top, width, height }: IRect) {
    const path: Array<number | string> = []

    path.push('M', left, top)
    path.push('L', left + width, top)
    path.push('L', left + width, top + height)
    path.push('L', left, top + height)

    path.push('Z')
    return path
  }
}

module.exports = DomHighlighter
module.exports.default = DomHighlighter

const regRgb = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/
const regRgba = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/

function isColor(color: string) {
  return regRgb.test(color) || regRgba.test(color)
}

function rgbToHex(rgb: string) {
  const color = Color.parse(rgb)
  const opacity = color.val[3] || 1
  color.val = color.val.slice(0, 3)
  color.val.push(Math.round(255 * opacity))
  return '#' + upperCase(hex.encode(color.val))
}

function normalizeColor(color: string | IRgb) {
  if (isStr(color)) {
    return color
  }

  color = color as IRgb

  if (color.a) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  }

  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

function propertiesToValues(
  computedStyle: CSSStyleDeclaration,
  properties: string[],
  useCamelCase = false
) {
  const ret: any = {}
  each(properties, (property) => {
    let value = (computedStyle as any)[
      property === 'text-opacity' ? 'color' : property
    ]
    if (!value) {
      return
    }
    if (isColor(value)) {
      value = rgbToHex(value)
      if (property === 'text-opacity') {
        value = value.slice(7)
        value = hex.decode(value)[0] / 255
      }
    }
    if (useCamelCase) {
      property = camelCase(property)
    }
    ret[property] = value
  })
  return ret
}
