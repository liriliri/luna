import 'luna-retro-handheld.css'
import story from '../share/story'
import RetroHandheld from 'luna-retro-handheld.js'
import readme from './README.md'

const def = story(
  'retro-handheld',
  (container) => {
    const retroHandheld = new RetroHandheld(container)

    return retroHandheld
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { retroHandheld } = def
