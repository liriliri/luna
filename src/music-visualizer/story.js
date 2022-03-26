import 'luna-music-visualizer.css'
import MusicVisualizer from 'luna-music-visualizer.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'music-visualizer',
  (container) => {
    const musicVisualizer = new MusicVisualizer(container)

    return musicVisualizer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { musicVisualizer } = def
