import Cropper from './index'
import test from '../share/test'

test('cropper', (container) => {
  const cropper = new Cropper(container, {
    url: 'https://res.liriliri.io/chii/wallpaper.jpg',
  })

  it('basic', function () {
    expect(cropper.getData()).to.be.a('object')
  })

  return cropper
})
