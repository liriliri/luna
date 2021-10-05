const Gallery = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const gallery = new Gallery(container)

describe('gallery', function () {
  it('basic', function () {
    gallery.show()
  })
})
