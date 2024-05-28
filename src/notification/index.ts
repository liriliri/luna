import $ from 'licia/$'
import uniqId from 'licia/uniqId'
import find from 'licia/find'
import h from 'licia/h'
import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'
import isUndef from 'licia/isUndef'

/** IPosition */
export interface IPosition {
  /** X position. */
  x: 'left' | 'center' | 'right'
  /** Y position. */
  y: 'top' | 'bottom'
}

/** INotifyOptions */
export interface INotifyOptions {
  /** Notification duration. */
  duration?: number
  /** Notification icon. */
  icon?: string
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Notification position. */
  position?: IPosition
  /** Default duration, 0 means infinite. */
  duration?: number
  /** Enable inline mode. */
  inline?: boolean
}

/**
 * Show notifications.
 *
 * @example
 * const container = document.getElementById('container')
 * const notification = new LunaNotification(container, {
 *   position: {
 *     x: 'left',
 *     y: 'top',
 *   },
 * })
 * notification.notify('luna', {
 *   duration: 2000,
 * })
 * notification.dismissAll()
 */
export default class Notification extends Component<IOptions> {
  private notifications: NotificationItem[] = []
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'notification' }, options)

    this.initOptions(options, {
      position: {
        x: 'right',
        y: 'bottom',
      },
      inline: false,
      duration: 2000,
    })

    if (!this.options.inline) {
      this.$container.addClass(this.c('full'))
    }

    this.initTpl()
  }
  /** Show notification. */
  notify(content: string, options: INotifyOptions = {}) {
    if (isUndef(options.duration)) {
      options.duration = this.options.duration
    }

    const notification = new NotificationItem(this, content, {
      icon: options.icon || 'none',
    })
    this.notifications.push(notification)
    this.add(notification)
    setTimeout(() => this.remove(notification.id), options.duration)
  }
  /** Dismiss all notifications. */
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
    const { x, y } = this.options.position

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
  constructor(
    notification: Notification,
    content: string,
    options: { icon: string }
  ) {
    this.$container = $(this.container)
    this.notification = notification
    this.content = content
    this.id = uniqId('luna-notification-')

    this.$container.attr({
      id: this.id,
      class: notification.c(
        `item ${
          notification.getOption('position').y === 'bottom' ? 'lower' : 'upper'
        }`
      ),
    })

    this.initTpl(options.icon)
  }
  destroy() {
    this.$container.remove()
  }
  private initTpl(icon: string) {
    let iconName = icon
    if (icon === 'success') {
      iconName = 'check'
    } else if (icon === 'warning') {
      iconName = 'warn'
    }
    const iconHtml =
      icon === 'none'
        ? ''
        : `<div class="icon-container ${icon}"><span class="icon icon-${iconName}"></span></div>`
    this.$container.html(
      this.notification.c(
        `${iconHtml}<div class="content">${this.content}</div>`
      )
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Notification)
}
