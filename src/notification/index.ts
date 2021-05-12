import $ from 'licia/$'
import uniqId from 'licia/uniqId'
import find from 'licia/find'
import h from 'licia/h'
import Component from '../share/Component'

interface IPosition {
  x: string
  y: string
}

class Notification extends Component {
  private notifications: NotificationItem[] = []
  private duration: number
  position: IPosition
  constructor(
    container: Element,
    {
      position = {
        x: 'right',
        y: 'bottom',
      },
      duration = 2000,
    } = {}
  ) {
    super(container, { compName: 'notification' })

    this.position = position
    this.duration = duration

    this.initTpl()
  }
  notify(content: string, { duration = this.duration } = {}) {
    const notification = new NotificationItem(this, content)
    this.notifications.push(notification)
    this.add(notification)
    if (duration) {
      setTimeout(() => this.remove(notification.id), duration)
    }
  }
  dismissAll() {
    const { notifications } = this
    let notification = notifications[0]
    while (notification) {
      this.remove(notification.id)
      notification = notifications[0]
    }
  }
  private add(notification: NotificationItem) {
    this.container.appendChild(notification.container)
  }
  private remove(id: string) {
    const { notifications } = this
    const notification = find(
      notifications,
      (notification) => notification.id === id
    )
    if (!notification) return
    notification.destroy()
    const idx = notifications.indexOf(notification)
    notifications.splice(idx, 1)
  }
  private initTpl() {
    const { $container } = this
    const { x, y } = this.position

    let justifyContent = 'flex-end'
    let alignItems = 'flex-end'
    switch (x) {
      case 'center':
        alignItems = 'center'
        break
      case 'left':
        alignItems = 'flex-start'
        break
    }
    if (y === 'top') justifyContent = 'flex-start'

    $container.attr(
      'style',
      `justify-content: ${justifyContent}; align-items: ${alignItems}`
    )
  }
}

class NotificationItem {
  id: string
  container: HTMLElement = h('div')
  private $container: $.$
  private notification: Notification
  private content: string
  constructor(notification: Notification, content: string) {
    this.$container = $(this.container)
    this.notification = notification
    this.content = content
    this.id = uniqId('luna-notification-')

    this.$container.attr({
      id: this.id,
      class: notification.c(
        `item ${notification.position.y === 'bottom' ? 'lower' : 'upper'}`
      ),
    })

    this.render()
  }
  destroy() {
    this.$container.remove()
  }
  private render() {
    this.$container.html(
      this.notification.c(`<div class="content">${this.content}</div>`)
    )
  }
}

export default Notification

module.exports = Notification
module.exports.default = Notification
