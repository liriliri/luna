import Carousel from './index'
import test from '../share/test'

test('carousel', (container) => {
  const carousel = new Carousel(container)

  it('basic', function () {
    carousel.append('Item 1')
    const $item = $(container).find(carousel.c('.item'))
    expect($item.html()).to.equal('Item 1')
  })

  return carousel
})
