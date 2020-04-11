# Luna Notification

Show notifications.

## Install

```bash
npm install luna-notification --save
```

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-notification/luna-notification.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-notification.js"></script>
```

## Usage

```javascript
const notification = new LunaNotification(document.body, {
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
```