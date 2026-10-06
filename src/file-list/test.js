import FileList from './index'
import test from '../share/test'

test('file-list', (container) => {
  it('basic', function () {
    const fileList = new FileList(container, {
      files: [
        {
          name: 'test.txt',
          size: 1024,
          directory: false,
          mtime: new Date(),
        },
        {
          name: 'folder 1',
          directory: true,
          mtime: new Date(),
        },
        {
          name: 'picture.jpg',
          thumbnail: '',
          size: 2048,
          directory: false,
        },
      ],
    })
  })

  it('multi selections', function () {
    const fileList = new FileList(container, {
      multiSelections: true,
      files: [
        { name: 'a.txt', mtime: new Date(), size: 1 },
        { name: 'b.txt', mtime: new Date(), size: 2 },
        { name: 'c.txt', mtime: new Date(), size: 3 },
      ],
    })

    expect(fileList.getOption('multiSelections')).to.be.true
    expect(fileList.getSelected()).to.have.lengthOf(0)

    fileList.setOption('listView', true)
    expect(fileList.getSelected()).to.have.lengthOf(0)
  })
})
