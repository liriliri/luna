import Setting from './index'
import test from '../share/test'

test('setting', (container) => {
  const setting = new Setting(container)
  it('basic', function () {
    setting.appendTitle('Test')
  })
})
