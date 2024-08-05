import Gallery from './index'
import test from '../share/test'

test('gallery', (container) => {
  const gallery = new Gallery(container)

  it('basic', function () {
    gallery.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
    gallery.append('https://luna.liriliri.io/pic2.png', 'pic2.png')
    gallery.append('https://luna.liriliri.io/pic3.png', 'pic3.png')
    gallery.append('https://luna.liriliri.io/pic4.png', 'pic4.png')
    gallery.show()
  })

  return gallery
})
