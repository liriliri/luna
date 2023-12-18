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

## Configuration

* filter(string | RegExp | AnyFn): Setting filter.
* separatorCollapse(boolean): Whether to collapse separator or not.

## Api

### appendButton(title: string, description: string, handler: AnyFn): LunaSettingButton

Append button.

### appendCheckbox(key: string, value: boolean, title: string, description?: string): LunaSettingCheckbox

Append checkbox setting.

### appendHtml(html: string | HTMLElement): LunaSettingHtml

Append html setting.

### appendInput(key: string, value: string, title: string, description?: string): LunaSettingInput

Append text input setting.

### appendMarkdown(markdown: string): LunaSettingMarkdown

Append markdown description.

### appendNumber(key: string, value: number, title: string, description: string, options: INumberOptions): LunaSettingNumber

Append number setting.

### appendSelect(key: string, value: string, title: string, description: string, options: PlainObj<string>): LunaSettingSelect

Append select setting.

### appendSeparator(): LunaSettingSeparator

Append separator.

### appendTitle(title: string, level?: number): LunaSettingTitle

Append title.

### clear(): void

Clear all settings.

### remove(item: LunaSettingItem): void

Remove setting.

## Types

### INumberOptions

* max(number): Max value.
* min(number): Min value.
* range(boolean): Use slider control or not.
* step(number): Interval between legal numbers.
