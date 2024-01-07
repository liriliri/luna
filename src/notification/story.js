import 'luna-notification.css'
import Notification from 'luna-notification.js'
import readme from './README.md'
import { select, text, number, button, boolean } from '@storybook/addon-knobs'
import story from '../share/story'
import $ from 'licia/$'

const def = story(
  'notification',
  (container) => {
    const x = select('X', ['left', 'center', 'right'], 'center')
    const y = select('Y', ['top', 'bottom'], 'top')

    const inline = boolean('Inline Mode', false)

    const notification = new Notification(container, {
      position: {
        x,
        y,
      },
      inline,
    })

    if (inline) {
      $(container).css({
        width: '100%',
        maxWidth: 640,
        height: 360,
        border: '1px solid #eee',
      })
    }

    const content = text('Content', 'Luna Notification')
    const duration = number('Duration', 5000, {
      range: true,
      min: 0,
      max: 100000,
      step: 1000,
    })

    function notify() {
      notification.notify(content, {
        duration,
      })
    }

    notify()

    button('Notify', () => {
      notify()
      return false
    })

    button('Dismiss All', () => {
      notification.dismissAll()
      return false
    })

    return notification
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { notification } = def
