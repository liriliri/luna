import Cropper from './index'
import test from '../share/test'

test('cropper', (container) => {
  const cropper = new Cropper(container, {
    url: 'https://luna.liriliri.io/wallpaper.png',
  })

  it('basic', function () {
    expect(cropper.getData()).to.be.a('object')
  })

  return cropper
})
