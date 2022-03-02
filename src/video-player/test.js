import VideoPlayer from './index'
import test from '../share/test'

test('video-player', (container) => {
  it('basic', () => {
    const videoPlayer = new VideoPlayer(container)
    videoPlayer.play()
  })
})
