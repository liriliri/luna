import toArr from 'licia/toArr'
import each from 'licia/each'

export default function (name, testFn) {
  /* eslint-disable no-undef */
  const isHeadless = __karma__.config.headless
  if (!isHeadless && window.location.pathname === '/context.html') {
    window.open('/debug.html', 'debugTab')
  }
  describe(name, function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    let components = testFn(container)
    if (components) {
      components = toArr(components)
      window.components = components
      window.component = components[0]
    }
    if (isHeadless) {
      after(function () {
        if (window.components) {
          each(window.components, (component) => component.destroy())
        }
      })
    }
  })
}
