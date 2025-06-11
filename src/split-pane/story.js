import 'luna-split-pane.css'
import SplitPane from 'luna-split-pane.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'split-pane',
  (container) => {
    const splitPane = new SplitPane(container, {})

    return splitPane
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { splitPane } = def
