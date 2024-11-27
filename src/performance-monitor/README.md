# Luna Performance Monitor

Realtime counter used for displaying cpu, fps metrics.

## Demo

https://luna.liriliri.io/?path=/story/performance-monitor

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-performance-monitor/luna-performance-monitor.css" />
<script src="//cdn.jsdelivr.net/npm/luna-performance-monitor/luna-performance-monitor.js"></script>
```

You can also get it on npm.

```bash
npm install luna-performance-monitor --save
```

```javascript
import 'luna-performance-monitor/luna-performance-monitor.css'
import LunaPerformanceMonitor from 'luna-performance-monitor'
```

## Usage

```javascript
const memoryMonitor = new PerformanceMonitor(container, {
  title: 'Used JS heap size',
  unit: 'MB',
  color: '#614d82',
  smooth: false,
  data() {
    return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
  },
})
memoryMonitor.start()
```

## Configuration

* color(string): Line color.
* data(Fn<number>): Data source provider, a number should be returned.
* height(number): Chart height.
* max(number): Maximum value.
* smooth(boolean): Smooth lines or not.
* title(string): Monitor title.
* unit(string): Unit of the value.

## Api

### start(): void

Start monitoring.

### stop(): void

Stop monitoring.
