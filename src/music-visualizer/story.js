import 'luna-music-visualizer.css'
import 'luna-music-player.css'
import MusicVisualizer from 'luna-music-visualizer.js'
import MusicPlayer from 'luna-music-player.js'
import $ from 'licia/$'
import h from 'licia/h'
import story from '../share/story'
import readme from './README.md'
import { object, boolean } from '@storybook/addon-knobs'
import LunaMusicVisualizer from './react'
import LunaMusicPlayer from '../music-player/react'
import { useState } from 'react'

const def = story(
  'music-visualizer',
  (wrapper) => {
    $(wrapper).html('').css({
      boxShadow:
        '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1)',
      width: 640,
      margin: '0 auto',
      maxWidth: '100%',
    })

    const { audio, image } = createKnobs()

    const musicPlayerContainer = h('div')
    $(musicPlayerContainer).css({
      width: 640,
      margin: '0 auto',
      maxWidth: '100%',
      border: 'none',
    })
    const musicPlayer = new MusicPlayer(musicPlayerContainer, {
      audio,
      listFolded: true,
    })

    const container = h('div')
    $(container).css({
      aspectRatio: '768/512',
    })

    const musicVisualizer = new MusicVisualizer(container, {
      audio: musicPlayer.getAudio(),
      image: image ? '/wallpaper.png' : '',
      fftSize: 512,
    })

    wrapper.appendChild(container)
    wrapper.appendChild(musicPlayerContainer)

    return [musicVisualizer, musicPlayer]
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { audio, image } = createKnobs()
      const [audioObj, setAudioObj] = useState(new Audio())

      return (
        <div
          style={{
            boxShadow:
              '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1)',
            width: 640,
            margin: '0 auto',
            maxWidth: '100%',
          }}
        >
          <LunaMusicVisualizer
            style={{
              aspectRatio: '768/512',
            }}
            audio={audioObj}
            image={image ? '/wallpaper.png' : ''}
            fftSize={512}
          />
          <LunaMusicPlayer
            theme={theme}
            audio={audio}
            listFolded
            style={{
              width: 640,
              margin: '0 auto',
              maxWidth: '100%',
              border: 'none',
            }}
            onCreate={(musicPlayer) => {
              setAudioObj(musicPlayer.getAudio())
            }}
          />
        </div>
      )
    },
  }
)

function createKnobs() {
  const audio = object('Audio', [
    {
      url: '/Give_a_reason.mp3',
      cover: '/Give_a_reason.jpg',
      title: 'Give a Reason',
      artist: '林原めぐみ',
    },
  ])

  const image = boolean('Background Image', true)

  return {
    audio,
    image,
  }
}

export default def

export const { musicVisualizer: html, react } = def
