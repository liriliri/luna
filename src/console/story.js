import 'luna-console.css'
import h from 'licia/h'
import $ from 'licia/$'
import toEl from 'licia/toEl'
import Console from 'luna-console.js'
import readme from './README.md'
import { button, number, boolean, text } from '@storybook/addon-knobs'
import story from '../share/story'

const def = story(
  'console',
  (wrapper) => {
    $(wrapper)
      .css({
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
      })
      .html('')
    const container = h('div')
    wrapper.appendChild(container)

    const maxNum = number('Max Number', 1000, {
      range: true,
      min: 0,
      max: 10000,
      step: 100,
    })

    const asyncRender = boolean('Asynchronous Rendering', true)
    const showHeader = boolean('Show Log Time and From', false)
    const unenumerable = boolean('Show Unenumerable', true)
    const accessGetter = boolean('Access Getter', true)
    const lazyEvaluation = boolean('Lazy Evaluation', true)

    const console = new Console(container, {
      maxNum,
      asyncRender,
      showHeader,
      accessGetter,
      unenumerable,
      lazyEvaluation,
    })

    function logMessage() {
      console.log('log')
      console.warn('warn')
      console.error(Error('test'))
      console.info('info')
      console.debug('debug')
      console.time('test')
      console.timeEnd('test')
      console.count('luna')
      console.count('luna')
      console.assert(true, 'assert msg')
      var site1 = { name: 'Runoob', site: 'www.runoob.com' }
      var site2 = { name: 'Google', site: 'www.google.com' }
      var site3 = { name: 'Taobao', site: 'www.taobao.com' }
      console.table([site1, site2, site3], ['site'])
      const el = toEl('<div class="test"><div class="test-inner"></div></div>')
      console.log('test dom', el)
      console.dir(el)
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
      console.log(
        'navigator: %o location: %o performance: %o',
        navigator,
        location,
        performance
      )
      var arr = []
      for (var i = 0; i < 10000; i++) arr.push(i)
      console.log(arr)
    }

    logMessage()

    const code = text('JavaScript', '1 + 2')
    console.evaluate(code)

    button('Log Message', () => {
      logMessage()
      return false
    })

    button('Log 10000 Messages', () => {
      for (var i = 0; i < 10000; i++) {
        console.log('Number: ', i)
      }
      return false
    })

    button('Clear', () => {
      console.clear()
      return false
    })

    return console
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { console } = def
