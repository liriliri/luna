import h from 'licia/h'
import extend from 'licia/extend'
import MusicPlayer from 'luna-music-player.js'
import 'luna-music-player.css'
import { withKnobs, object } from '@storybook/addon-knobs'
import isPromise from 'licia/isPromise'
import noop from 'licia/noop'

export default {
  title: 'Music Player',
  decorators: [withKnobs],
}

export const musicPlayer = () => {
  const wrapper = h('div')
  extend(wrapper.style, {
    width: '600px',
    margin: '0 auto',
    maxWidth: '100%',
  })
  const container = h('div')
  wrapper.appendChild(container)

  const audio = object('Audio', {
    url: 'https://test.surunzi.com/audio/Give_a_reason.mp3',
    cover: 'https://test.surunzi.com/audio/Give_a_reason.jpg',
    title: 'Give a Reason',
    artist: '林原めぐみ',
  })

  const musicPlayer = new MusicPlayer(container, {
    audio,
  })

  const result = musicPlayer.play()
  if (isPromise(result)) {
    result.catch(noop)
  }

  return wrapper
}
