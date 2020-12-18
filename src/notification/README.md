# Luna Notification

Show notifications.

## Demo

https://luna.liriliri.io/?path=/story/notification

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-notification/luna-notification.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-notification.js"></script>
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
const notification = new Notification(container, {
  position: {
    x: 'left',
    y: 'top',
  },
})
notification.notify('luna', {
  duration: 2000,
})
notification.dissmissAll()
```

## Configuration

* position(object): Notification position.
* duration(number): Default duration.

Position:

* x(string): Left, center or right.
* y(string): Top or bottom.

## Api

### notify(content: string, options: object): void

Show notification.

Options:

* duration(number): Notification duration.

### dismissAll(): void

Dismiss all notifications.


