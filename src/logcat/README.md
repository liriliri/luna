# Luna Logcat

Android logcat viewer.

## Demo

https://luna.liriliri.io/?path=/story/logcat

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-logcat/luna-logcat.css" />
<script src="//cdn.jsdelivr.net/npm/luna-logcat/luna-logcat.js"></script>
```

You can also get it on npm.

```bash
npm install luna-logcat --save
```

```javascript
import 'luna-logcat/luna-logcat.css'
import LunaLogcat from 'luna-logcat'
```

## Usage

```javascript
const logcat = new LunaLogcat(container)
logcatp.append({
  date: '2021-01-01 00:00:00',
  package: 'com.example',
  pid: 1234,
  tid: 1234,
  priority: 3,
  tag: 'tag',
  message: 'message',
})
```

## Configuration

* entries(IEntry[]): Log entries.
* filter(IFilter): Log filter.
* maxNum(number): Max entry number, zero means infinite.
* wrapLongLines(boolean): Wrap long lines.

## Api

### append(entry: IEntry): void

Append entry.

### clear(): void

Clear all entries.

## Types

### IFilter

* package(string): Package name.
* priority(number): Entry priority.
* tag(string): Tag name.
