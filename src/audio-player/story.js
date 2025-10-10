import 'luna-audio-player.css'
import story from '../share/story'
import readme from './README.md'
import AudioPlayer from 'luna-audio-player.js'
import LunaAudioPlayer from './react'
import { number } from '@storybook/addon-knobs'

const def = story(
  'audio-player',
  (container) => {
    const { waveHeight } = createKnobs()

    const audioPlayer = new AudioPlayer(container, {
      url: '/Get_along.mp3',
      name: 'Get along',
      waveHeight,
    })

    return audioPlayer
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { waveHeight } = createKnobs()

      return (
        <LunaAudioPlayer
          theme={theme}
          url="/Get_along.mp3"
          name="Get along"
          waveHeight={waveHeight}
        />
      )
    },
  }
)

function createKnobs() {
  const waveHeight = number('Wave Height', 60, {
    range: true,
    min: 20,
    max: 100,
    step: 1,
  })

  return {
    waveHeight,
  }
}

export default def

export const { audioPlayer: html, react } = def
