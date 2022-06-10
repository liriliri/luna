import 'luna-keyboard.css'
import Keyboard from 'luna-keyboard.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'keyboard',
  (container) => {
    const keyboard = new Keyboard(container)

    return keyboard
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { keyboard } = def
