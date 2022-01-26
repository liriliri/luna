import 'luna-menu-bar.css'
import MenuBar from 'luna-menu-bar.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'menu-bar',
  (container) => {
    const menuBar = new MenuBar(container)

    return menuBar
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { menuBar } = def
