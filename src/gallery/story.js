import 'luna-gallery.css'
import Gallery from 'luna-gallery.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'gallery',
  (container) => {
    const gallery = new Gallery(container)

    return gallery
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { gallery } = def
