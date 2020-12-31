const VideoPlayer = require('./index')
require('./style.scss')
require('./icon.css')

describe('video-player', function () {
  it('basic', function () {
    const container = document.createElement('container')
    document.body.appendChild(container)

    const videoPlayer = new VideoPlayer(container)
    videoPlayer.play()
  })
})
