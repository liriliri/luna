import 'luna-scrollbar.css'
import Scrollbar from 'luna-scrollbar.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'scrollbar',
  (container) => {
    const scrollbar = new Scrollbar(container)

    return scrollbar
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { scrollbar } = def
