import Notification from './index'
import test from '../share/test'

test('notification', (container) => {
  const notification = new Notification(container, {
    position: {
      x: 'right',
      y: 'top',
    },
  })

  it('basic', () => {
    const $container = $(container)

    notification.notify('luna', { duration: 5000 })
    expect($container.find('.luna-notification-item').length).to.equal(1)

    notification.dismissAll()
    expect($container.find('.luna-notification-item').length).to.equal(0)
  })

  return notification
})
