# Luna Setting

Settings panel.

## Demo

https://luna.liriliri.io/?path=/story/setting

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-setting/luna-setting.css" />
<script src="//cdn.jsdelivr.net/npm/luna-setting/luna-setting.js"></script>
```

You can also get it on npm.

```bash
npm install luna-setting --save
```

```javascript
import 'luna-setting/luna-setting.css'
import LunaSetting from 'luna-setting'
```

## Usage

```javascript
const setting = new LunaSetting(container)
const title = setting.appendTitle('Title')
setting.appendSeparator()
title.detach()
```

## Api

### appendButton(handler: AnyFn, title: string, description?: string): SettingButton

Append button.

### appendCheckbox(key: string, value: boolean, title: string, description?: string): SettingCheckbox

Append checkbox setting.

### appendInput(key: string, value: string, title: string, description?: string): SettingInput

Append text input setting.

### appendNumber(key: string, value: number, title: string, description: string, options?: INumberOptions): SettingNumber

Append number setting.

### appendSelect(key: string, value: string, title: string, description: string, options: PlainObj<string>): SettingSelect

Append select setting.

### appendSeparator(): SettingSeparator

Append separator.

### appendTitle(title: string): SettingTitle

Append title.

## Types

### INumberOptions

* max(number): Max value.
* min(number): Min value.
* range(boolean): Use slider control or not.
* step(number): Interval between legal numbers.
