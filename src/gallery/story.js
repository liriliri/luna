import 'luna-gallery.css'
import Gallery from 'luna-gallery.js'
import $ from 'licia/$'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import story from '../share/story'
import { button, boolean } from '@storybook/addon-knobs'
import LunaGallery from './react'
import { useState } from 'react'

const def = story(
  'gallery',
  (container) => {
    const inline = boolean('Inline Mode', false)
    if (inline) {
      $(container).css({
        width: '100%',
        maxWidth: 640,
        height: 360,
        margin: '0 auto',
      })
    }

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
    ReactComponent() {
      const [visible, setVisible] = useState(true)

      button('Show', () => {
        setVisible(true)
        return false
      })

      button('Hide', () => {
        setVisible(false)
        return false
      })

      return (
        <LunaGallery
          visible={visible}
          onClose={() => setVisible(false)}
          current={1}
          images={[
            { src: '/pic1.png', title: 'pic1.png' },
            { src: '/pic2.png', title: 'pic2.png' },
            { src: '/pic3.png', title: 'pic3.png' },
            { src: '/pic4.png', title: 'pic4.png' },
          ]}
        />
      )
    },
  }
)

export default def

export const { gallery: html, react } = def
