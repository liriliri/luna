import 'luna-lrc-player.css'
import LrcPlayer from 'luna-lrc-player.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'lrc-player',
  (container) => {
    const lrcPlayer = new LrcPlayer(container)

    return lrcPlayer
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { lrcPlayer } = def
