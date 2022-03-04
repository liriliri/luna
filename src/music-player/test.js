import MusicPlayer from './index'
import test from '../share/test'

test('music-player', (container) => {
  const musicPlayer = new MusicPlayer(container, {
    audio: [],
  })

  it('basic', function () {
    musicPlayer.play()
  })

  return musicPlayer
})
