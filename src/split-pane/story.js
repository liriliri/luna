import 'luna-split-pane.css'
import SplitPane from 'luna-split-pane.js'
import story from '../share/story'
import readme from './README.md'
import $ from 'licia/$'
import toEl from 'licia/toEl'
import { colorBorder, colorBorderDark } from '../share/theme'
import { optionsKnob } from '@storybook/addon-knobs'

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

    const { direction } = createKnobs()

    const splitPane = new SplitPane(container, {
      direction,
    })

    splitPane.append(toEl('<div style="background: red;"></div>'), {
      weight: 30,
    })

    splitPane.append(toEl('<div style="background: blue;"></div>'), {
      weight: 70,
    })

    return splitPane
  },
  {
    readme,
    source: __STORY__,
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

  return {
    direction,
  }
}

export default def

export const { splitPane } = def
