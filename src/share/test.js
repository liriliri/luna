import toArr from 'licia/toArr'
import each from 'licia/each'
import contain from 'licia/contain'

/* eslint-disable no-undef */
const karma = __karma__

export default function (name, testFn) {
  const isHeadless = karma.config.headless
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

export function getPublicPath(p) {
  let isMatch = false
  each(karma.files, (val, file) => {
    if (isMatch) {
      return
    }
    if (contain(file, `public/${p}`)) {
      p = file
      isMatch = true
    }
  })
  return p
}
