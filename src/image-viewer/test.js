import ImageViewer from './index'
import test from '../share/test'

test('image-viewer', (container) => {
  const imageViewer = new ImageViewer(container, {
    image: 'https://luna.liriliri.io/wallpaper.png',
  })
  it('basic', function () {
    imageViewer.zoom(0.1)
  })
})
