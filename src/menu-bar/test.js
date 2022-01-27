const MenuBar = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

describe('menu', function () {
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
