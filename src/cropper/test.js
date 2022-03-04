import Cropper from './index'
import test, { getPublicPath } from '../share/test'

test('cropper', (container) => {
  const cropper = new Cropper(container, {
    url: getPublicPath('wallpaper.jpg'),
  })

  it('basic', function () {
    expect(cropper.getData()).to.be.a('object')
  })

  return cropper
})
