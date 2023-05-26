import ImageViewer from './index'
import test from '../share/test'

test('image-viewer', (container) => {
  const imageViewer = new ImageViewer(container, {
    image: 'https://res.liriliri.io/luna/pic1.jpg',
  })
  it('basic', function () {
    imageViewer.zoom(0.1)
  })
})
