import 'luna-tab.css'
import Tab from 'luna-tab.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'tab',
  (container) => {
    const tab = new Tab(container)

    return tab
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { tab } = def
