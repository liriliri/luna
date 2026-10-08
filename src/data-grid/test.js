import DataGrid from './index'
import test from '../share/test'

test('data-grid', (container) => {
  it('basic', function () {
    const dataGrid = new DataGrid(container, {
      columns: [
        {
          id: 'index',
          title: 'Index',
          weight: 20,
          sortable: true,
        },
        {
          id: 'name',
          title: 'Name',
          sortable: true,
          weight: 30,
        },
        {
          id: 'site',
          title: 'Site',
        },
      ],
    })
    dataGrid.append({
      index: 0,
      name: 'Taobao',
      site: 'www.taobao.com',
    })
  })

  it('multi selections', function (done) {
    const dataGrid = new DataGrid(container, {
      columns: [
        {
          id: 'name',
          title: 'Name',
        },
      ],
      selectable: true,
      multiSelections: true,
    })
    const a = dataGrid.append({ name: 'A' })
    const b = dataGrid.append({ name: 'B' })
    const c = dataGrid.append({ name: 'C' })

    setTimeout(() => {
      a.container.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(dataGrid.getSelected()).to.have.lengthOf(1)
      expect(dataGrid.getSelected()[0]).to.equal(a)

      c.container.dispatchEvent(
        new MouseEvent('click', { bubbles: true, ctrlKey: true })
      )
      expect(dataGrid.getSelected()).to.have.lengthOf(2)
      expect(dataGrid.getSelected()).to.include(a)
      expect(dataGrid.getSelected()).to.include(c)

      b.container.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(dataGrid.getSelected()).to.have.lengthOf(1)
      expect(dataGrid.getSelected()[0]).to.equal(b)

      c.container.dispatchEvent(
        new MouseEvent('click', { bubbles: true, shiftKey: true })
      )
      expect(dataGrid.getSelected()).to.have.lengthOf(2)
      expect(dataGrid.getSelected()).to.include(b)
      expect(dataGrid.getSelected()).to.include(c)

      let clickNodes
      dataGrid.on('click', (e, nodes) => {
        clickNodes = nodes
      })
      b.container.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(dataGrid.getSelected()).to.have.lengthOf(2)
      setTimeout(() => {
        expect(dataGrid.getSelected()).to.have.lengthOf(1)
        expect(dataGrid.getSelected()[0]).to.equal(b)
        expect(clickNodes).to.be.an('array')
        expect(clickNodes).to.have.lengthOf(1)
        expect(clickNodes[0]).to.equal(b)

        dataGrid.container.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        )
        expect(dataGrid.getSelected()).to.have.lengthOf(0)
        done()
      }, 250)
    }, 50)
  })
})
