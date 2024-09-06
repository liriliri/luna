import 'luna-image-list.css'
import ImageList from 'luna-image-list.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'image-list',
  (container) => {
    const imageList = new ImageList(container)

    return imageList
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { imageList } = def
