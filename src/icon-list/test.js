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
    expect(iconList.select(0)).to.be.true
    expect(iconList.getSelected()).to.have.lengthOf(1)
  })

  it('multi selections', function () {
    const iconList = new IconList(container, {
      multiSelections: true,
    })
    iconList.setIcons([
      { src: '/logo.png', name: 'A' },
      { src: '/logo.png', name: 'B' },
      { src: '/logo.png', name: 'C' },
    ])

    expect(iconList.select(0)).to.be.true
    expect(iconList.select(2)).to.be.true
    expect(iconList.getSelected()).to.have.lengthOf(1)
    expect(iconList.getSelected()[0].data.name).to.equal('C')
  })
})
