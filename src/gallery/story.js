import 'luna-gallery.css'
import Gallery from 'luna-gallery.js'
import $ from 'licia/$'
import readme from './README.md'
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

    gallery.append('https://res.liriliri.io/luna/pic1.jpg', 'pic1.jpg')
    gallery.append('https://res.liriliri.io/luna/pic2.jpg', 'pic2.jpg')
    gallery.append('https://res.liriliri.io/luna/pic3.jpg', 'pic3.jpg')
    gallery.append('https://res.liriliri.io/luna/pic4.jpg', 'pic4.jpg')

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
    source: __STORY__,
  }
)

export default def

export const { gallery } = def
