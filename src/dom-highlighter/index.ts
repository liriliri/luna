import Component from '../share/Component'
import { HighlightOverlay } from './overlay/tool_highlight'
import { pxToNum } from '../share/util'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import lowerCase from 'licia/lowerCase'

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
}

export default class DomHighlighter extends Component {
  private overlay: HighlightOverlay = new HighlightOverlay(window)
  private target: HTMLElement | null
  private resizeSensor: ResizeSensor
  private reset: () => void
  private options: Required<IOptions>
  constructor(
    container: HTMLElement,
    {
      showRulers = false,
      showExtensionLines = false,
      showInfo = true,
      showStyles = true,
      showAccessibilityInfo = true,
    }: IOptions = {}
  ) {
    super(container, { compName: 'dom-highlighter' })

    this.options = {
      showRulers,
      showExtensionLines,
      showInfo,
      showStyles,
      showAccessibilityInfo,
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

    const { left, top, width, height } = target.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(target)
    const getNumStyle = (name: string) =>
      pxToNum(computedStyle.getPropertyValue(name))

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

    const highlight: any = {
      paths: [contentPath, paddingPath, borderPath, marginPath],
      showExtensionLines: this.options.showExtensionLines,
      showRulers: this.options.showRulers,
      colorFormat: 'hsl',
    }

    if (this.options.showInfo) {
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
        elementInfo.style = {
          color: '#000000FF',
          'font-family':
            '"Product Sans", "Open Sans", Roboto, Arial, "Product Sans", "Open Sans", Roboto, Arial',
          'font-size': '20px',
          'line-height': '25px',
          padding: '0px',
          margin: '20px 0px',
          'background-color': '#FFFFFFFF',
        }
      }

      if (this.options.showAccessibilityInfo) {
        elementInfo.showAccessibilityInfo = true
        ;(elementInfo.contrast = {
          fontSize: '20px',
          fontWeight: '400',
          backgroundColor: '#FFFFFFFF',
          textOpacity: 0.1,
          contrastAlgorithm: 'aa',
        }),
          (elementInfo.isKeyboardFocusable = false)
        elementInfo.accessibleName = 'name'
        elementInfo.accessibleRole = 'role'
      }

      highlight.elementInfo = elementInfo
    }

    this.overlay.drawHighlight(highlight)
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
