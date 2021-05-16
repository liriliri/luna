import 'luna-carousel.css'
import Carousel from 'luna-carousel.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'carousel',
  () => {
    const carousel = new Carousel()

    return carousel
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { carousel } = def
