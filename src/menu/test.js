const Menu = require('./index')
require('./style.scss')
require('./icon.css')

describe('menu', function () {
  it('basic', function () {
    const menu = new Menu()

    let newFileClicked = false
    menu.append({
      label: 'New File',
      click() {
        newFileClicked = true
        console.log('New File clicked')
      },
    })

    const openSubMenu = new Menu()
    openSubMenu.append({
      label: 'index.html',
      click() {
        console.log('index.html clicked')
      },
    })
    openSubMenu.append({
      label: 'example.js',
      click() {
        console.log('example.js clicked')
      },
    })
    menu.append({
      type: 'submenu',
      label: 'Open',
      submenu: openSubMenu,
    })

    const stylesSubMenu = new Menu()
    stylesSubMenu.append({
      label: 'about.css',
      click() {
        console.log('about.css clicked')
      },
    })
    stylesSubMenu.append({
      label: 'index.css',
      click() {
        console.log('index.css clicked')
      },
    })
    openSubMenu.append({
      type: 'submenu',
      label: 'Styles',
      submenu: stylesSubMenu,
    })

    menu.append({
      type: 'separator',
    })
    menu.append({
      label: 'Quit',
      click() {
        console.log('Quit clicked')
      },
    })

    menu.show(0, 0)

    const $container = $(menu.container)
    const $first = $container.find('.luna-menu-item').first()
    expect($first.text()).to.equal('New File')
    $first.click()
    expect(newFileClicked).to.be.true
  })
})
