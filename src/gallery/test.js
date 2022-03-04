import Gallery from './index'
import test, { getPublicPath } from '../share/test'

test('gallery', (container) => {
  const gallery = new Gallery(container)

  it('basic', function () {
    gallery.append(getPublicPath('pic1.jpg'), 'pic1.jpg')
    gallery.append(getPublicPath('pic2.jpg'), 'pic2.jpg')
    gallery.append(getPublicPath('pic3.jpg'), 'pic3.jpg')
    gallery.append(getPublicPath('pic4.jpg'), 'pic4.jpg')
    gallery.show()
  })

  return gallery
})
