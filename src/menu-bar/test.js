import MenuBar from './index'
import test from '../share/test'

test('menu', (container) => {
  it('basic', function () {
    MenuBar.build(container, [
      {
        label: 'File',
        submenu: [
          {
            type: 'submenu',
            label: 'Open',
            submenu: [
              {
                label: 'index.html',
              },
              {
                label: 'example.js',
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            label: 'Exit',
          },
        ],
      },
    ])
  })
})
