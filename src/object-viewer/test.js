const ObjectViewer = require('./index')
require('./style.scss')
require('./icon.css')

const defineProp = require('licia/defineProp')
const stringifyAll = require('licia/stringifyAll')

const data = { a: 1, b: function () {}, c: 'unenumerable' }
defineProp(data, 'c', {
  unenumerable: true,
})
defineProp(data, 'd', {
  get() {
    return 'getter'
  },
})
data.e = data
data.f = []
for (let i = 0; i < 10000; i++) {
  data.f.push(i)
}
data.g = /test/
data.h = void 0
data.i = null

describe('object-viewer', function () {
  it('basic', function () {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const objectViewer = new ObjectViewer(container, {
      unenumerable: true,
      accessGetter: true,
    })

    objectViewer.set(data)

    const $container = $(container)
    expect($container.attr('class')).to.equal('luna-object-viewer')

    const $ul = $container.children('li').children('ul')
    expect($ul.children('li').length).to.equal(11)

    const $arrLi = $ul.children('li').eq(4)

    const $icon = $arrLi.children('span').eq(0)
    expect($icon.hasClass('luna-object-viewer-collapsed')).to.be.true
    $arrLi.click()
    expect($icon.hasClass('luna-object-viewer-collapsed')).to.be.false
    $arrLi.click()
    expect($icon.hasClass('luna-object-viewer-collapsed')).to.be.true

    objectViewer.destroy()
  })

  it('static', function () {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const objectViewer = new ObjectViewer.Static(container)
    objectViewer.set(
      stringifyAll(data, {
        unenumerable: false,
        accessGetter: true,
      })
    )

    const $container = $(container)
    expect($container.attr('class')).to.equal('luna-object-viewer')

    const $ul = $container.children('li').children('ul')
    expect($ul.children('li').length).to.equal(9)

    const $fnLi = $ul.children('li').eq(1)

    expect($fnLi.children('span').eq(1).text()).to.equal('b')
    expect($fnLi.children('span').eq(2).text()).to.equal('ƒ ()')
    $fnLi.click()

    objectViewer.destroy()
  })
})
