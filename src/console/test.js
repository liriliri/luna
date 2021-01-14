const $ = require('licia/$')
const escape = require('licia/escape')
const Console = require('./index')
require('./style.scss')
require('./icon.css')

const container = document.createElement('div')
document.body.appendChild(container)

const console = new Console(container, {
  asyncRender: false,
})

const { c } = console

function log(i) {
  return $(logs()[i].container)
}

function logContent(i) {
  return log(i).find(c('.log-content'))
}

function logs() {
  return console.displayLogs
}

describe('console', function () {
  beforeEach(function () {
    console.clear(true)
  })

  it('string', function () {
    const text = '<span>This is a log</span>'
    console.log(text)
    expect(logContent(0).html()).to.include(escape(text))
  })

  it('clear', function () {
    expect($(container).find(`${c('logs')} li`).length).to.equal(0)
  })

  it('recognize url', function () {
    console.log('http://liriliri.github.io/eruda/?plugin=fps')
    expect(logContent(0).html()).to.include(
      '<a href="http://liriliri.github.io/eruda/?plugin=fps" target="_blank">http://liriliri.github.io/eruda/?plugin=fps</a>'
    )
  })

  it('basic object', function () {
    const obj = { a: 1 }
    console.log(obj)
    expect(logContent(0).text()).to.include('Object {a: 1}')
  })

  it('html', function () {
    const html = '<span class="color-blue">Blue</span>'
    console.html(html)
    expect(logContent(0).html()).to.include(html)
  })

  it('timing', function () {
    console.time('luna')
    console.timeEnd('luna')
    expect(logContent(0).text()).to.match(/luna: [.\d]+ms/)
  })

  it('error', function () {
    console.error(new Error('error test'))
    expect(logContent(0).find(c('.stack')).length).to.equal(1)
    expect(logContent(0).text()).to.include('error test')
  })

  it('assert', function () {
    console.assert(true, 'assert')
    expect(logs().length).to.equal(0)

    console.assert(false, 'assert')
    expect(logs().length).to.equal(1)
  })

  it('count', function () {
    console.count('test')
    console.count('test')
    expect(logContent(1).text()).to.include('test: 2')
  })

  describe('substitution', function () {
    it('number', function () {
      console.log('Eruda is %d', 1.2, 'year old')
      expect(logContent(0).text()).to.include('Eruda is 1 year old')
      console.clear(true)

      console.log('%i', 1.2, 'year old')
      expect(logContent(0).text()).to.include('1 year old')
      console.clear(true)

      console.log('%f', 1.2, 'year old')
      expect(logContent(0).text()).to.include('1.2 year old')
    })

    it('string', function () {
      console.log('My name is %s', 'eruda')
      expect(logContent(0).text()).to.include('My name is eruda')
    })

    it('object', function () {
      console.log('Object is %O', { a: 1 })
      expect(logContent(0).text()).to.include('Object is {a: 1}')
      console.clear(true)

      console.log('Dom is %o', document.createElement('script'))
      expect(logContent(0).text()).to.include('Dom is <script></script>')
    })

    it('style', function () {
      console.log('%cblue%cgreen', 'color:blue', 'color:green')
      expect(logContent(0).text()).to.include('bluegreen')
    })

    it('Repeat log', function () {
      for (let i = 0; i < 10; i++) console.log(1)
      expect(logs().length).to.equal(1)
      expect(log(0).text()).to.include('10')
    })
  })

  describe('table', function () {
    it('wrong args', function () {
      console.table('test')
      expect(log(0).find(c('.table')).find('table').length).to.equal(0)
    })

    it('sort keys', function () {
      console.table([{ a: 1 }, { d: 2, a: 2 }, { c: 1 }])
      expect(
        log(0)
          .find(`${c('.table')} thead tr`)
          .html()
      ).to.include('<th>(index)</th><th>a</th><th>c</th><th>d</th>')
    })

    it('basic', function () {
      console.table([{ test: 1 }, { test: 2, test2: 3 }])
      expect(log(0).find(`${c('.table')} tbody tr`).length).to.equal(2)
      expect(log(0).find(`${c('.table')} thead th`).length).to.equal(3)
    })

    it('filter', function () {
      console.table([{ test: 1 }, { test: 2, test2: 3 }], 'test')
      expect(log(0).find(`${c('.table')} thead th`).length).to.equal(2)
    })
  })

  describe('filter', function () {
    // Test case from https://github.com/liriliri/eruda/issues/14
    it('function', function () {
      console.setOption('filter', function (log) {
        return log.type !== 'error'
      })

      let obj = {}
      Object.defineProperty(obj, 'a', {
        get: function () {
          console.error('deprecated')

          return 1
        },
      })
      console.log(obj)
      expect(logs().length).to.equal(1)

      console.setOption('filter', 'all')
    })

    it('all info error warn log', function () {
      console.log('log')
      console.info('info')
      console.error('error')
      console.warn('warn')
      console.debug('debug')
      expect(logs().length).to.equal(5)

      console.setOption('filter', 'info')
      expect(logs().length).to.equal(1)
      expect(log(0).get(0).log.type).to.equal('info')

      console.setOption('filter', 'error')
      expect(logs().length).to.equal(1)
      expect(log(0).get(0).log.type).to.equal('error')

      console.setOption('filter', 'warn')
      expect(logs().length).to.equal(1)
      expect(log(0).get(0).log.type).to.equal('warn')

      console.setOption('filter', 'debug')
      expect(logs().length).to.equal(1)
      expect(log(0).get(0).log.type).to.equal('debug')

      console.setOption('filter', 'all')
    })

    it('regex', function () {
      console.log('test')
      console.log('test2')
      expect(logs().length).to.equal(2)

      console.setOption('filter', /test2/)
      expect(logs().length).to.equal(1)
      expect(logContent(0).text()).to.include('test2')

      console.setOption('filter', 'all')
    })
  })

  describe('options', function () {
    it('max number', function () {
      console.setOption('maxNum', 10)
      for (let i = 0; i < 20; i++) console.log(i)
      expect(logs().length).to.equal(10)
    })

    it('display extra info', function () {
      console.setOption('showHeader', true)
      console.log('test')
      expect(log(0).find(c('.header')).length).to.equal(1)
    })
  })
})
