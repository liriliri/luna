export default function (name, testFn) {
  /* eslint-disable no-undef */
  if (
    !__karma__.config.headless &&
    window.location.pathname === '/context.html'
  ) {
    window.open('/debug.html', 'debugTab')
  }
  describe(name, function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    testFn(container)
  })
}
