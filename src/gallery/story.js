import 'luna-gallery.css'
import Gallery from 'luna-gallery.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'gallery',
  (container) => {
    const gallery = new Gallery(container)
    gallery.show()

    gallery.append('/pic1.jpg', 'pic1.jpg')
    gallery.append('/pic2.jpg', 'pic2.jpg')
    gallery.append('/pic3.jpg', 'pic3.jpg')
    gallery.append('/pic4.jpg', 'pic4.jpg')

    return gallery
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { gallery } = def
