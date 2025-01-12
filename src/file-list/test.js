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
})
