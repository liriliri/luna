import VideoPlayer from './index'
import './style.scss'
import './icon.css'
import test from '../share/test'

test('video-player', (container) => {
  it('basic', () => {
    const videoPlayer = new VideoPlayer(container)
    videoPlayer.play()
  })
})
