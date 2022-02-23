import Notification from './index'
import './style.scss'
import test from '../share/test'

test('notification', (container) => {
  it('basic', () => {
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
