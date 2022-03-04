import Modal from './index'
import test from '../share/test'

test('modal', (container) => {
  const title = 'This is the Title'
  const modal = new Modal(container, {
    title,
    content: 'This is the content.',
  })

  it('basic', function () {
    modal.show()
    expect($(container).html()).to.include(title)
  })

  return modal
})
