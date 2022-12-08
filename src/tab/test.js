import Tab from './index'
import test from '../share/test'

test('tab', container => {
  const tab = new Tab(container)

  it('basic', function () {
    tab.append({
      id: 'console',
      title: 'Console'
    })
    const $item = $(container).find(tab.c('.item'))
    expect($item.text()).to.equal('Console')
  })

  return tab
})