import 'luna-music-player.css'
import story from '../share/story'
import $ from 'licia/$'
import MusicPlayer from 'luna-music-player.js'
import { object } from '@storybook/addon-knobs'
import readme from './README.md'

const def = story(
  'music-player',
  (container) => {
    $(container).css({
      width: 640,
      margin: '0 auto',
      maxWidth: '100%',
    })

    const audio = object('Audio', [
      {
        url: '/Get_along.mp3',
        cover: '/Get_along.jpg',
        title: 'Get Along',
        artist: '林原めぐみ',
      },
      {
        url: '/Give_a_reason.mp3',
        cover: '/Give_a_reason.jpg',
        title: 'Give a Reason',
        artist: '林原めぐみ',
      },
    ])

    const musicPlayer = new MusicPlayer(container, {
      audio,
    })

    return musicPlayer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { musicPlayer } = def
