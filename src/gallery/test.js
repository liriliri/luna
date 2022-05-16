import Gallery from './index'
import test from '../share/test'

test('gallery', (container) => {
  const gallery = new Gallery(container)

  it('basic', function () {
    gallery.append('https://res.liriliri.io/luna/pic1.jpg', 'pic1.jpg')
    gallery.append('https://res.liriliri.io/luna/pic2.jpg', 'pic2.jpg')
    gallery.append('https://res.liriliri.io/luna/pic3.jpg', 'pic3.jpg')
    gallery.append('https://res.liriliri.io/luna/pic4.jpg', 'pic4.jpg')
    gallery.show()
  })

  return gallery
})
