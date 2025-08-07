import PathBar from './index'
import test from '../share/test'

test('path-bar', (container) => {
  it('basic', () => {
    const pathBar = new PathBar(container, {
      path: '/home/user',
    })
    pathBar.setOption('path', '/home/user/documents')
  })
})
