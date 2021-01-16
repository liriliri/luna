import 'luna-contextmenu.css'
import Contextmenu from 'luna-contextmenu.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'contextmenu',
  (container) => {
    const contextmenu = new Contextmenu()

    return contextmenu
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { contextmenu } = def
