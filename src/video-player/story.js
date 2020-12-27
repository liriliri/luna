import 'luna-video-player.css'
import story from '../share/story'
import VideoPlayer from 'luna-video-player.js'
import $ from 'licia/$'
import h from 'licia/h'

const def = story('video-player', (wrapper) => {
  $(wrapper)
    .css({
      maxWidth: 640,
      margin: '0 auto',
      minHeight: 150,
    })
    .html('')
  const container = h('div')
  wrapper.appendChild(container)

  const videoPlayer = new VideoPlayer(container, {
    url:
      'https://api.dogecloud.com/player/get.mp4?vcode=9dbb405e2141b5e8&userId=2096&flsign=1c02d5e60d2a0f29e1fd2ec0c0762b8b&ext=.mp4',
  })

  return videoPlayer
})

export default def

export const { videoPlayer } = def
