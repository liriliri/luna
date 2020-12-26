const MusicPlayer = require('./index')
require('./style.scss')
require('./icon.css')

describe('music-player', function () {
  it('basic', function () {
    const container = document.getElementById('container')
    const musicPlayer = new LunaMusicPlayer(container, {
      audio: [],
    })
    musicPlayer.play()
  })
})
