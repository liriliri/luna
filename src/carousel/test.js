import Carousel from './index'
import pointerEvent from 'licia/pointerEvent'
import test from '../share/test'

test('carousel', (container) => {
  const carousel = new Carousel(container)

  it('basic', function () {
    carousel.append('Item 1')
    const $item = $(container).find(carousel.c('.item'))
    expect($item.html()).to.equal('Item 1')
  })

  it('swipe', function (done) {
    carousel.append('Item 2')
    carousel.append('Item 3')
    expect(carousel.getActiveIdx()).to.equal(0)

    const body = $(container).find(carousel.c('.body')).get(0)
    carousel.once('slide', () => {
      expect(carousel.getActiveIdx()).to.equal(1)
      done()
    })
    body.dispatchEvent(
      new PointerEvent(pointerEvent('down'), {
        bubbles: true,
        clientX: 200,
        clientY: 100,
      })
    )
    document.dispatchEvent(
      new PointerEvent(pointerEvent('up'), {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      })
    )
  })

  return carousel
})
