import 'luna-painter.css'
import Painter from 'luna-painter.js'
import story from '../share/story'
import readme from './README.md'
import { number } from '@storybook/addon-knobs'
import $ from 'licia/$'
import LunaPainter from './react'

const def = story(
  'painter',
  (container) => {
    $(container).css({
      width: '100%',
      maxWidth: 1200,
      height: 600,
      margin: '0 auto',
    })

    const { width, height } = createKnobs()

    const painter = new Painter(container, {
      width,
      height,
      tool: 'pencil',
    })

    onCreate(painter)

    return painter
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { width, height } = createKnobs()

      return (
        <LunaPainter
          theme={theme}
          width={width}
          height={height}
          style={{
            width: '100%',
            maxWidth: 1200,
            height: 600,
            margin: '0 auto',
          }}
          tool="pencil"
          onCreate={onCreate}
        />
      )
    },
  }
)

function onCreate(painter) {
  const ctx = painter.getActiveLayer().getContext()
  const canvas = painter.getCanvas()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const idx = painter.addLayer()
  painter.activateLayer(idx)
  painter.renderCanvas()
}

function createKnobs() {
  const width = number('Width', 512, {
    range: true,
    min: 128,
    max: 2048,
    step: 2,
  })

  const height = number('Height', 512, {
    range: true,
    min: 128,
    max: 2048,
    step: 2,
  })

  return {
    width,
    height,
  }
}

export default def

export const { painter: html, react } = def
