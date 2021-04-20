const Cropper = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const cropper = new Cropper(container, {
  url: '/wallpaper.jpg',
})

describe('cropper', function () {
  it('basic', function () {
    expect(cropper.getData()).to.be.a('object')
  })
})
