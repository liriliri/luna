import AudioPlayer from './index'
import test from '../share/test'

test('audio-player', (container) => {
  const audioPlayer = new AudioPlayer(container, {
    url: '/Get_along.mp3',
  })

  it('basic', function () {
    audioPlayer.play()
  })

  return audioPlayer
})
