import 'luna-audio-player.css'
import story from '../share/story'
import readme from './README.md'
import AudioPlayer from 'luna-audio-player.js'
import LunaAudioPlayer from './react'

const def = story(
  'audio-player',
  (container) => {
    const audioPlayer = new AudioPlayer(container, {
      url: '/Get_along.mp3',
      name: 'Get along',
    })

    return audioPlayer
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      return <LunaAudioPlayer theme={theme} url="/Get_along.mp3" name="Get along"/>
    },
  }
)

export default def

export const { audioPlayer: html, react } = def
