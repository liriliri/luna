import story from '../share/story'
import h from 'licia/h'
import extend from 'licia/extend'
import MusicPlayer from 'luna-music-player.js'
import 'luna-music-player.css'
import { object } from '@storybook/addon-knobs'
import isPromise from 'licia/isPromise'
import noop from 'licia/noop'
import readme from './README.md'

const def = story(
  'music-player',
  (wrapper) => {
    extend(wrapper.style, {
      width: '600px',
      margin: '0 auto',
      maxWidth: '100%',
    })
    const container = h('div')
    wrapper.appendChild(container)

    const audio = object('Audio', [
      {
        url: 'https://test.surunzi.com/audio/Get_along.mp3',
        cover: 'https://test.surunzi.com/audio/Get_along.jpg',
        title: 'Get Along',
        artist: '林原めぐみ',
      },
      {
        url: 'https://test.surunzi.com/audio/Give_a_reason.mp3',
        cover: 'https://test.surunzi.com/audio/Give_a_reason.jpg',
        title: 'Give a Reason',
        artist: '林原めぐみ',
      },
      {
        url: 'https://test.surunzi.com/audio/Breeze.mp3',
        cover: 'https://test.surunzi.com/audio/Breeze.jpg',
        title: 'Breeze',
        artist: '林原めぐみ',
      },
    ])

    const musicPlayer = new MusicPlayer(container, {
      audio,
    })

    const result = musicPlayer.play()
    if (isPromise(result)) {
      result.catch(noop)
    }

    return musicPlayer
  },
  {
    readme,
  }
)

export default def

export const { musicPlayer } = def
