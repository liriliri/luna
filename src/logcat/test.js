import Logcat from './index'
import test from '../share/test'

test('log', (container) => {
  const logcat = new Logcat(container)

  it('basic', () => {
    logcat.append({
      date: '2024-10-28T07:21:37.452Z',
      pid: 31332,
      tid: 17073,
      priority: 5,
      tag: 'System.err',
      message:
        'java.lang.NoSuchMethodException: android.view.IWindowManager$Stub$Proxy.getRotation []',
      package: 'com.example',
    })
  })

  return logcat
})
