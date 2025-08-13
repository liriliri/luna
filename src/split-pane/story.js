import 'luna-split-pane.css'
import SplitPane from 'luna-split-pane.js'
import story from '../share/story'
import readme from './README.md'
import $ from 'licia/$'
import toEl from 'licia/toEl'
import {
  colorBorder,
  colorBorderDark,
  red5,
  blue5,
  green5,
} from '../share/theme'
import { number, optionsKnob } from '@storybook/addon-knobs'
import ReactSplitPane, {
  LunaSplitPaneItem as ReactSplitPaneItem,
} from './react'
import VueSplitPane, { LunaSplitPaneItem as VueSplitPaneItem } from './vue'
import { h } from 'vue'

const def = story(
  'split-pane',
  (container, theme) => {
    $(container).css({
      width: '100%',
      maxWidth: 640,
      margin: '0 auto',
      height: 360,
      border: `1px solid ${theme === 'light' ? colorBorder : colorBorderDark}`,
    })

    const { direction, minSize } = createKnobs()

    const splitPane = new SplitPane(container, {
      direction,
    })
    splitPane.on('resize', (weights) => {
      console.log('resize', weights)
    })

    const commonStyle = `display:flex;align-items:center;justify-content:center;color:white;font-size:48px`
    splitPane.append(
      toEl(`<div style="${commonStyle};background:${red5};">1</div>`),
      {
        weight: 30,
        minSize,
      }
    )

    splitPane.append(
      toEl(
        `<iframe style="border:none;" src="https://en.wikipedia.org/wiki/Slayers"/>`
      ),
      {
        weight: 40,
        minSize,
      }
    )

    splitPane.append(
      toEl(`<div style="${commonStyle};background:${green5};">3</div>`),
      {
        weight: 30,
        minSize,
      }
    )

    return splitPane
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { direction, minSize } = createKnobs()

      const commonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 48,
      }

      return (
        <ReactSplitPane
          direction={direction}
          theme={theme}
          style={{
            width: '100%',
            maxWidth: 640,
            margin: '0 auto',
            height: 360,
            border: `1px solid ${
              theme === 'light' ? colorBorder : colorBorderDark
            }`,
          }}
          onResize={(weights) => {
            console.log('resize', weights)
          }}
        >
          <ReactSplitPaneItem
            weight={30}
            minSize={minSize}
            style={{ ...commonStyle, background: red5 }}
          >
            1
          </ReactSplitPaneItem>
          <ReactSplitPaneItem
            weight={40}
            visible={false}
            minSize={minSize}
            style={{ ...commonStyle, background: blue5 }}
          >
            2
          </ReactSplitPaneItem>
          <ReactSplitPaneItem
            weight={30}
            minSize={minSize}
            style={{ ...commonStyle, background: green5 }}
          >
            3
          </ReactSplitPaneItem>
        </ReactSplitPane>
      )
    },
    VueComponent({ theme }) {
      const { direction, minSize } = createKnobs()

      const commonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '48px',
      }

      return h(
        VueSplitPane,
        {
          direction,
          theme,
          style: {
            width: '100%',
            maxWidth: '640px',
            margin: '0 auto',
            height: '360px',
            border: `1px solid ${
              theme === 'light' ? colorBorder : colorBorderDark
            }`,
          },
        },
        [
          h(
            VueSplitPaneItem,
            {
              weight: 30,
              minSize,
              style: { ...commonStyle, background: red5 },
            },
            () => '1'
          ),
          h(
            VueSplitPaneItem,
            {
              weight: 40,
              visible: false,
              minSize,
              style: { ...commonStyle, background: blue5 },
            },
            () => '2'
          ),
          h(
            VueSplitPaneItem,
            {
              weight: 30,
              minSize,
              style: { ...commonStyle, background: green5 },
            },
            () => '3'
          ),
        ]
      )
    },
  }
)

function createKnobs() {
  const direction = optionsKnob(
    'Direction',
    {
      Horizontal: 'horizontal',
      Vertical: 'vertical',
    },
    'horizontal',
    {
      display: 'select',
    }
  )

  const minSize = number('Min Size', 50, {
    range: true,
    min: 20,
    max: 150,
    step: 5,
  })

  return {
    direction,
    minSize,
  }
}

export default def

export const { splitPane: html, react, vue } = def
