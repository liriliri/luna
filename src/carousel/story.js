import 'luna-carousel.css'
import Carousel from 'luna-carousel.js'
import $ from 'licia/$'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'carousel',
  (container) => {
    $(container).css({
      maxWidth: 640,
      margin: '0 auto',
      minHeight: 150,
      aspectRatio: '1280/720',
    })
    const carousel = new Carousel(container)

    carousel.append('<div style="background:#e73c5e">item 1</div>')
    carousel.append('<div style="background:#614d82">item 2</div>')
    carousel.append('<div style="background:#614d82">item 3</div>')

    return carousel
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { carousel } = def
