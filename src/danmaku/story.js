import 'luna-danmaku.css'
import story from '../share/story'
import Danmaku from 'luna-danmaku.js'
import readme from './README.md'

const def = story(
  'danmaku',
  (container) => {
    const danmaku = new Danmaku(container)

    return danmaku
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { danmaku } = def
