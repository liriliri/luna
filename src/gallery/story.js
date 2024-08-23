import 'luna-gallery.css'
import Gallery from 'luna-gallery.js'
import $ from 'licia/$'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import story from '../share/story'
import { button, boolean } from '@storybook/addon-knobs'

const def = story(
  'gallery',
  (container) => {
    $(container).css({
      width: '100%',
      maxWidth: 640,
      height: 360,
      margin: '0 auto',
    })

    const inline = boolean('Inline Mode', false)

    const gallery = new Gallery(container, {
      inline,
    })
    gallery.show()

    gallery.append('/pic1.png', 'pic1.png')
    gallery.append('/pic2.png', 'pic2.png')
    gallery.append('/pic3.png', 'pic3.png')
    gallery.append('/pic4.png', 'pic4.png')

    button('Show', () => {
      gallery.show()
      return false
    })

    button('Clear', () => {
      gallery.clear()
      return false
    })

    return gallery
  },
  {
    readme,
    changelog,
    source: __STORY__,
  }
)

export default def

export const { gallery } = def
