import 'luna-color-picker.css'
import ColorPicker from 'luna-color-picker'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'color-picker',
  (container) => {
    const colorPicker = new ColorPicker(container)

    return colorPicker
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { colorPicker } = def
