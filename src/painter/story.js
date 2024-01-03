import 'luna-painter.css'
import Painter from 'luna-painter.js'
import story from '../share/story'
import readme from './README.md'
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

    const painter = new Painter(container, {
      width: 512,
      height: 512,
      tool: 'pencil',
    })

    return painter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { painter } = def
