import 'luna-cropper.css'
import Cropper from 'luna-cropper.js'
import readme from './README.md'
import story from '../share/story'
import $ from 'licia/$'

const def = story(
  'cropper',
  (container) => {
    $(container).css({
      aspectRatio: '1',
    })

    const cropper = new Cropper(container, {
      url: '/wallpaper.jpg',
    })

    return cropper
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { cropper } = def
