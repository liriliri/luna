import Log from './index'
import test from '../share/test'

test('log', (container) => {
  const log = new Log(container)

  it('basic', () => {
    log.setOption({
      log: 'npm install',
    })
  })

  return log
})
