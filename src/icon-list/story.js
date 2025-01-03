import story from '../share/story'
import IconList from 'luna-icon-list.js'
import readme from './README.md'

const def = story(
  'icon-list',
  (container) => {
    const iconList = new IconList(container)

    return iconList
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { iconList } = def
