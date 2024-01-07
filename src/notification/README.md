# Luna Notification

Show notifications.

## Demo

https://luna.liriliri.io/?path=/story/notification

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-notification/luna-notification.css" />
<script src="//cdn.jsdelivr.net/npm/luna-notification/luna-notification.js"></script>
```

You can also get it on npm.

```bash
npm install luna-notification --save
```

```javascript
import 'luna-notification/luna-notification.css'
import LunaNotification from 'luna-notification'
```

## Usage

```javascript
const container = document.getElementById('container')
const notification = new LunaNotification(container, {
  position: {
    x: 'left',
    y: 'top',
  },
})
notification.notify('luna', {
  duration: 2000,
})
notification.dismissAll()
```

## Configuration

* duration(number): Default duration, 0 means infinite.
* inline(boolean): Enable inline mode.
* position(IPosition): Notification position.

## Api

### dismissAll(): void

Dismiss all notifications.

### notify(content: string, options?: INotifyOptions): void

Show notification.

## Types

### INotifyOptions

* duration(number): Notification duration.

### IPosition

* x('left' | 'center' | 'right'): X position.
* y('top' | 'bottom'): Y position.
