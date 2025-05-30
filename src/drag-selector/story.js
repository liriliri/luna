import 'luna-drag-selector.css'
import LunaDragSelector from 'luna-drag-selector.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'drag-selector',
  (container) => {
    const dragSelector = new LunaDragSelector(container)

    return dragSelector
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { dragSelector } = def
