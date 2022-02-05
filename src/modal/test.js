const $ = require('licia/$')
const Modal = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const title = 'This is the Title'

const modal = new Modal(container, {
  title,
  content: 'This is the content.',
})

describe('modal', function () {
  it('basic', function () {
    modal.show()
    expect($(container).html()).to.include(title)
  })
})
