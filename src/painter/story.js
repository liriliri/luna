import 'luna-painter.css'
import Painter from 'luna-painter.js'
import story from '../share/story'
import readme from './README.md'
import { number } from '@storybook/addon-knobs'
import $ from 'licia/$'

const def = story(
  'painter',
  (container) => {
    $(container).css({
      width: '100%',
      maxWidth: 1200,
      height: 600,
      margin: '0 auto',
    })

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

    const painter = new Painter(container, {
      width,
      height,
      tool: 'pencil',
    })

    const ctx = painter.getActiveLayer().getContext()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    const idx = painter.addLayer()
    painter.activateLayer(idx)
    painter.renderCanvas()

    return painter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { painter } = def
