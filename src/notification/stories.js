import h from 'licia/h'
import 'notification.css'
import Notification from 'notification.js'
import { withKnobs, select, text, number, button } from '@storybook/addon-knobs'

export default {
  title: 'Notification',
  decorators: [withKnobs]
}

export const Basic = () => {
  const container = h('div')

  const x = select('X', ['left', 'center', 'right'], 'center')
  const y = select('Y', ['top', 'bottom'], 'top')

  const notification = new Notification(container, {
    position: {
      x,
      y
    }
  })

  const content = text('Content', 'Luna Notification')
  const duration = number('Duration', 5000, {
    range: true,
    min: 0,
    max: 100000,
    step: 1000
  })

  function notify() {
    notification.notify(content, {
      duration
    })
  }

  notify()

  button('Add', () => {
    notify()
    return false
  })

  button('Dismiss All', () => {
    notification.dismissAll()
    return false
  })
  // setTimeout(() => notification.dismissAll(), 10000)

  return container
}
