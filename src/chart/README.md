# Luna Chart

HTML5 charts.

## Demo

https://luna.liriliri.io/?path=/story/chart

## Install

Add the following script and style to your page.

```html
<script src="//cdn.jsdelivr.net/npm/luna-chart/luna-chart.js"></script>
```

You can also get it on npm.

```bash
npm install luna-chart --save
```

```javascript
import LunaChart from 'luna-chart'
```

## Usage

```javascript
const container = document.getElementById('container')
const barChart = new LunaChart(container, {
  type: 'bar',
  bgColor: '#fbfbfb',
  title: {
      text: 'Bar Chart',
  },
  data: {
    labels: ['Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Dataset 1',
        bgColor: '#e73c5e',
        data: [128, 146, 56, 84, 222],
      },
      {
        label: '#614d82',
        bgColor: '#614d82',
        data: [119, 23, 98, 67, 88],
      },
    ],
  },
})
```
