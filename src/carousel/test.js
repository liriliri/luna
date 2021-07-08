const $ = require('licia/$')
const Carousel = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const carousel = new Carousel(container)
carousel.append('Item 1')

describe('carousel', function () {
  it('basic', function () {
    const $item = $(container).find(carousel.c('.item'))
    expect($item.html()).to.equal('Item 1')
  })
})
