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
import { elementRoles } from 'aria-query'

interface IRect {
  left: number
  top: number
  width: number
  height: number
}

interface IOptions {
  showRulers?: boolean
  showExtensionLines?: boolean
  showInfo?: boolean
  showStyles?: boolean
  showAccessibilityInfo?: boolean
  colorFormat?: 'rgb' | 'hsl' | 'hex'
}

export default class DomHighlighter extends Component {
  private overlay: HighlightOverlay = new HighlightOverlay(window)
  private target: HTMLElement | null
  private resizeSensor: ResizeSensor
  private reset: () => void
  private options: Required<IOptions>
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
    }

    this.overlay.setContainer(container)
    this.overlay.setPlatform('mac')

    this.reset = throttle(() => this._reset(), 16)

    this.reset()
    this.bindEvent()
  }
  highlight(target: HTMLElement) {
    this.target = target

    if (this.resizeSensor) {
      this.resizeSensor.destroy()
    }
    this.resizeSensor = new ResizeSensor(target)
    this.resizeSensor.addListener(this.reset)

    this.draw()
  }
  hide() {
    this.target = null
    this.reset()
  }
  intercept(interceptor: (...args: any[]) => any | null) {
    this.interceptor = interceptor
  }
  destroy() {
    window.removeEventListener('resize', this.reset)
    window.removeEventListener('scroll', this.reset)
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
      fillColor: 'rgba(111, 168, 220, .66)',
      name: 'content',
    }

    const paddingPath = {
      path: this.rectToPath({
        left: left + bl,
        top: top + bt,
        width: width - bl - br,
        height: height - bt - bb,
      }),
      fillColor: 'rgba(147, 196, 125, .55)',
      name: 'padding',
    }

    const borderPath = {
      path: this.rectToPath({
        left,
        top,
        width,
        height,
      }),
      fillColor: 'rgba(255, 229, 153, .66)',
      name: 'border',
    }

    const marginPath = {
      path: this.rectToPath({
        left: left - ml,
        top: top - mt,
        width: width + ml + mr,
        height: height + mt + mb,
      }),
      fillColor: 'rgba(246, 178, 107, .66)',
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
    elementRoles.forEach((value, key) => {
      if (role) {
        return
      }

      const { name, attributes } = key
      if (name !== tagName) {
        return
      }

      if (attributes) {
        for (const attribute of attributes) {
          if (attribute.name && attribute.value) {
            if (target.getAttribute(attribute.name) !== attribute.value) {
              return
            }
          }
        }
      }

      role = value.values().next().value
    })

    return {
      accessibleName: name || target.getAttribute('title') || '',
      accessibleRole: role || 'generic',
    }
  }
  private bindEvent() {
    window.addEventListener('resize', this.reset)
    window.addEventListener('scroll', this.reset)
  }
  private _reset = () => {
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

    this.draw()
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
