import Scrollbar from './index'
import test from '../share/test'

test('scrollbar', (container) => {
  const scrollbar = new Scrollbar(container)

  it('basic', () => {
    expect(scrollbar.getContent().innerHTML).to.equal('')
  })

  return scrollbar
})
