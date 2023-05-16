import 'luna-toolbar.css'
import Toolbar from 'luna-toolbar.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'toolbar',
  (container) => {
    const toolbar = new Toolbar(container)

    return toolbar
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { toolbar } = def
