import 'luna-logcat.css'
import Logcat from 'luna-logcat.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'logcat',
  (container) => {
    const logcat = new Logcat(container)

    return logcat
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { logcat } = def
