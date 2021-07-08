import Component from '../share/Component'
import { HighlightOverlay } from './overlay/tool_highlight'

export default class DomHighlighter extends Component {
  private overlay: HighlightOverlay = new HighlightOverlay(window)
  constructor(container: HTMLElement) {
    super(container, { compName: 'dom-highlighter' })
    this.overlay.setPlatform('mac')
  }
  highlight() {
    const highlight: any = {
      paths: [
        {
          path: [
            'M',
            321.5,
            164,
            'L',
            593.5,
            164,
            'L',
            593.5,
            256,
            'L',
            321.5,
            256,
            'Z',
          ],
          fillColor: 'rgba(111, 168, 220, 0.658823529411765)',
          name: 'content',
        },
        {
          path: [
            'M',
            321.5,
            164,
            'L',
            593.5,
            164,
            'L',
            593.5,
            256,
            'L',
            321.5,
            256,
            'Z',
          ],
          fillColor: 'rgba(147, 196, 125, 0.549019607843137)',
          name: 'padding',
        },
        {
          path: [
            'M',
            321.5,
            164,
            'L',
            593.5,
            164,
            'L',
            593.5,
            256,
            'L',
            321.5,
            256,
            'Z',
          ],
          fillColor: 'rgba(255, 229, 153, 0.658823529411765)',
          name: 'border',
        },
        {
          path: [
            'M',
            321.5,
            164,
            'L',
            593.5,
            164,
            'L',
            593.5,
            256,
            'L',
            321.5,
            256,
            'Z',
          ],
          fillColor: 'rgba(246, 178, 107, 0.658823529411765)',
          name: 'margin',
        },
      ],
      showRulers: false,
      showExtensionLines: false,
      colorFormat: 'hex',
      elementInfo: {
        tagName: 'div',
        idValue: 'logo-default',
        className: '.show-logo',
        nodeWidth: 272,
        nodeHeight: 92,
        showAccessibilityInfo: true,
        isKeyboardFocusable: false,
        accessibleName: 'Google',
        accessibleRole: 'generic',
        style: {
          padding: '0px',
          margin: '0px',
          'background-color': '#00000000',
        },
      },
    }

    this.overlay.drawHighlight(highlight)
  }
}
