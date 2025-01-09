import IconList from './index'
import test from '../share/test'

test('icon-list', (container) => {
  it('basic', function () {
    const iconList = new IconList(container, {
      size: 64,
    })
    iconList.setIcons([
      {
        src: '/logo.png',
        name: 'Luna',
      },
    ])
  })
})
