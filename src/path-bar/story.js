import 'luna-path-bar.css'
import PathBar from 'luna-path-bar.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'path-bar',
  (container) => {
    const pathBar = new PathBar(container)

    return pathBar
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def

export const { pathBar } = def
