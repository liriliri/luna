import 'luna-painter'
import Painter from 'luna-painter.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'painter',
  (container) => {
    const painter = new Painter(container)

    return painter
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { painter } = def
