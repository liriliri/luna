import 'notification.css'
import Notification from 'notification.js'

export default {
  title: 'Notification'
}

export const Basic = () => {
  const notification = new Notification(document.body, {
    position: {
      x: 'center',
      y: 'top'
    }
  })
  notification.notify('Luna Notification')
  setTimeout(() => {
    notification.notify('Luna Notification Last for 5 seconds', {
      duration: 5000
    })
  }, 1000)
  notification.notify('Luna Notification', {
    duration: 0
  })
  setTimeout(() => notification.dismissAll(), 10000)

  return ''
}
