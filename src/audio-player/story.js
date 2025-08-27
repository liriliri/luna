import 'luna-audio-player.css'
import story from '../share/story'
import readme from './README.md'
import AudioPlayer from 'luna-audio-player.js'

const def = story(
  'audio-player',
  (container) => {
    const audioPlayer = new AudioPlayer(container, {
      url: '/Get_along.mp3',
    })

    return audioPlayer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { audioPlayer } = def
