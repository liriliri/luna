const MusicPlayer = require('./index')
require('./style.scss')
require('./icon.css')

describe('music-player', function () {
  it('basic', function () {
    const container = document.createElement('container')
    document.body.appendChild(container)

    const musicPlayer = new MusicPlayer(container, {
      audio: [],
    })
    musicPlayer.play()
  })
})
