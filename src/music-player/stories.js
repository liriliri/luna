import h from 'licia/h'
import extend from 'licia/extend'
import MusicPlayer from 'luna-music-player.js'
import 'luna-music-player.css'

export default {
  title: 'Music Player',
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

  const musicPlayer = new MusicPlayer(container)

  return wrapper
}
