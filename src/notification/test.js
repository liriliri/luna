const Notification = require('./index')
require('./style.scss')

describe('notification', function () {
  it('basic', function () {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const notification = new Notification(container, {
      position: {
        x: 'right',
        y: 'top',
      },
    })

    const $container = $(container)

    notification.notify('luna', { duration: 5000 })
    expect($container.find('.luna-notification-item').length).to.equal(1)

    notification.dismissAll()
    expect($container.find('.luna-notification-item').length).to.equal(0)
  })
})
