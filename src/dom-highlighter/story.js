import 'luna-dom-highlighter.css'
import DomHighlighter from 'luna-dom-highlighter.js'
import story from '../share/story'
import readme from './README.md'
import $ from 'licia/$'
import h from 'licia/h'
import { button, boolean, object, text, select } from '@storybook/addon-knobs'

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

    const element = text('Element', 'div#test.class1.class2')
    const innerText = text('Text', 'TARGET')

    const target = h(
      element,
      {
        style: targetStyle,
      },
      innerText
    )
    wrapper.appendChild(target)

    const container = h('div')
    wrapper.appendChild(container)

    const colorFormat = select('Color Format', ['rgb', 'hsl', 'hex'], 'hex')
    const showRulers = boolean('Show Rulers', true)
    const showExtensionLines = boolean('Show Extension Lines', true)
    const showInfo = boolean('Show Info', true)
    const showStyles = boolean('Show Styles', true)
    const showAccessibilityInfo = boolean('Show AccessibilityInfo', true)
    button('Highlight', () => {
      domHighlighter.highlight(target)
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
    })
    domHighlighter.intercept((highlight) => console.log('intercept', highlight))
    domHighlighter.highlight(target)

    return domHighlighter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { domHighlighter } = def
