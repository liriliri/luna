import 'luna-music-visualizer.css'
import 'luna-music-player.css'
import MusicVisualizer from 'luna-music-visualizer.js'
import MusicPlayer from 'luna-music-player.js'
import $ from 'licia/$'
import h from 'licia/h'
import story from '../share/story'
import readme from './README.md'
import { object, boolean } from '@storybook/addon-knobs'

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

    const audio = object('Audio', [
      {
        url: 'https://res.liriliri.io/luna/Give_a_reason.mp3',
        cover: 'https://res.liriliri.io/luna/Give_a_reason.jpg',
        title: 'Give a Reason',
        artist: '林原めぐみ',
      },
    ])
    const musicPlayerContainer = h('div')
    $(musicPlayerContainer).css({
      width: 640,
      margin: '0 auto',
      maxWidth: '100%',
      boxShadow: 'none',
    })
    const musicPlayer = new MusicPlayer(musicPlayerContainer, {
      audio,
      listFolded: true,
    })

    const container = h('div')
    $(container).css({
      aspectRatio: '1280/720',
    })

    const image = boolean('Background Image', true)

    const musicVisualizer = new MusicVisualizer(container, {
      audio: musicPlayer.getAudio(),
      image: image ? 'https://res.liriliri.io/luna/wallpaper.jpg' : '',
      fftSize: 512,
    })

    wrapper.appendChild(container)
    wrapper.appendChild(musicPlayerContainer)

    return [musicVisualizer, musicPlayer]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { musicVisualizer } = def
