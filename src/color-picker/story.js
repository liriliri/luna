import 'luna-color-picker.css'
import ColorPicker from 'luna-color-picker.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'color-picker',
  (container) => {
    const colorPicker = new ColorPicker()

    return colorPicker
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { colorPicker } = def
