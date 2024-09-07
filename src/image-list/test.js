import ImageList from './index'
import test from '../share/test'

test('image-list', (container) => {
  const imageList = new ImageList(container)

  it('basic', function () {
    imageList.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
    imageList.append('https://luna.liriliri.io/pic2.png', 'pic2.png')
    imageList.append('https://luna.liriliri.io/pic3.png', 'pic3.png')
    imageList.append('https://luna.liriliri.io/pic4.png', 'pic4.png')
  })

  return imageList
})
