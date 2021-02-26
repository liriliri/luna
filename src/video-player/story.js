import 'luna-video-player.css'
import story from '../share/story'
import VideoPlayer from 'luna-video-player.js'
import $ from 'licia/$'
import h from 'licia/h'
import noop from 'licia/noop'
import isPromise from 'licia/isPromise'
import readme from './README.md'
import { text } from '@storybook/addon-knobs'

const def = story(
  'video-player',
  (wrapper) => {
    $(wrapper)
      .css({
        maxWidth: 640,
        margin: '0 auto',
        minHeight: 150,
        aspectRatio: '1280/720',
      })
      .html('')
    const container = h('div')
    wrapper.appendChild(container)

    const url = text(
      'Video Url',
      'https://api.dogecloud.com/player/get.mp4?vcode=9dbb405e2141b5e8&userId=2096&flsign=1c02d5e60d2a0f29e1fd2ec0c0762b8b&ext=.mp4'
    )

    const videoPlayer = new VideoPlayer(container, {
      url,
    })

    const result = videoPlayer.play()
    if (isPromise(result)) {
      result.catch(noop)
    }

    return videoPlayer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { videoPlayer } = def
