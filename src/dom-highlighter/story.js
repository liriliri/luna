import 'luna-dom-highlighter.css'
import DomHighlighter from 'luna-dom-highlighter.js'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import $ from 'licia/$'
import h from 'licia/h'
import {
  button,
  boolean,
  object,
  text,
  select,
  color,
} from '@storybook/addon-knobs'

const def = story(
  'dom-highlighter',
  (wrapper) => {
    $(wrapper).html('')

    const targetStyle = object('Target Style', {
      position: 'absolute',
      left: 100,
      top: 200,
      width: 200,
      height: 150,
      color: '#fff',
      lineHeight: 150,
      padding: 20,
      fontSize: 30,
      border: '25px solid #614d82',
      textAlign: 'center',
      background: '#e73c5e',
      marginLeft: 100,
    })

    const targetAttributes = object('Target Attributes', {
      title: 'target',
      tabindex: '1',
    })

    const element = text('Element', 'div#test.class1.class2')
    const innerText = text('Text', 'TARGET')

    const target = h(
      element,
      {
        style: targetStyle,
        ...targetAttributes,
      },
      innerText
    )
    wrapper.appendChild(target)

    const container = h('div')
    wrapper.appendChild(container)

    const colorFormat = select('Color Format', ['rgb', 'hsl', 'hex'], 'hex')
    const contentColor = color('Content Color', 'rgba(111, 168, 220, .66)')
    const paddingColor = color('Padding Color', 'rgba(147, 196, 125, .55)')
    const borderColor = color('Border Color', 'rgba(255, 229, 153, .66)')
    const marginColor = color('Margin Color', 'rgba(246, 178, 107, .66)')
    const showRulers = boolean('Show Rulers', true)
    const showExtensionLines = boolean('Show Extension Lines', true)
    const showInfo = boolean('Show Info', true)
    const showStyles = boolean('Show Styles', true)
    const showAccessibilityInfo = boolean('Show AccessibilityInfo', true)
    const monitorResize = boolean('Monitor Resize', true)
    button('Highlight Element', () => {
      domHighlighter.highlight(target)
      return false
    })
    button('Highlight Text', () => {
      domHighlighter.highlight(target.childNodes[0])
      return false
    })
    button('Hide', () => {
      domHighlighter.hide()
      return false
    })

    const domHighlighter = new DomHighlighter(container, {
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
    })
    domHighlighter.intercept((highlight) => console.log('intercept', highlight))
    domHighlighter.highlight(target)

    return domHighlighter
  },
  {
    readme,
    changelog,
    source: __STORY__,
  }
)

export default def

export const { domHighlighter } = def
