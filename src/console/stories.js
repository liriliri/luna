import 'luna-console.css'
import h from 'licia/h'
import extend from 'licia/extend'
import Console from 'luna-console.js'
import readme from './README.md'
import { addReadme } from 'storybook-readme/html'
import { withKnobs, button } from '@storybook/addon-knobs'

export default {
  title: 'Console',
  decorators: [withKnobs, addReadme],
  parameters: {
    readme: {
      sidebar: readme,
    },
  },
}

export const Basic = () => {
  const wrapper = h('div')
  extend(wrapper.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
  })
  const container = h('div')
  wrapper.appendChild(container)

  const console = new Console(container)

  button('Log Message', () => {
    console.log('log')
    console.warn('warn')
    console.error(Error('test'))
    console.info('info')
    console.debug('debug')
    console.dir(document.createElement('div'))
    console.time('test')
    console.timeEnd('test')
    console.count('eruda')
    console.count('eruda')
    console.assert(true, 'assert msg')
    var site1 = { name: 'Runoob', site: 'www.runoob.com' }
    var site2 = { name: 'Google', site: 'www.google.com' }
    var site3 = { name: 'Taobao', site: 'www.taobao.com' }
    console.table([site1, site2, site3], ['site'])
    console.log('%c Oh my heavens!', 'background: #222; color: #bada55')
    console.log('This is the outer level')
    console.group()
    console.log('Level 2')
    console.group()
    console.log('Level 3')
    console.warn('More of level 3')
    console.groupEnd()
    console.log('Back to level 2')
    console.groupEnd()
    console.log('Back to the outer level')
    console.log(navigator)
    console.log(location)
    console.log(performance)
    var arr = []
    for (var i = 0; i < 10000; i++) arr.push(i)
    console.log(arr)
    return false
  })

  button('Clear', () => {
    console.clear()
    return false
  })

  return wrapper
}
