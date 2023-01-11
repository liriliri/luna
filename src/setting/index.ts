import $ from 'licia/$'
import h from 'licia/h'
import escape from 'licia/escape'
import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Settings panel.
 */
export default class Setting extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'setting' })
  }
  appendTitle(title: string) {
    const settingTitle = new SettingTitle(this, title)
    this.append(settingTitle)

    return settingTitle
  }
  appendSeparator() {
    const settingSeparator = new SettingSeparator(this)
    this.append(settingSeparator)

    return settingSeparator
  }
  appendInput(key: string, title: string) {
    const settingInput = new SettingInput(this, key, title)
    this.append(settingInput)

    return settingInput
  }
  appendCheckbox(key: string, title: string, description?: string) {
    const settingCheckbox = new SettingCheckbox(this, key, title, description)
    this.append(settingCheckbox)

    return settingCheckbox
  }
  append(item: SettingItem) {
    this.$container.append(item.container)
  }
}

class SettingItem {
  container: HTMLElement = h('div')
  $container: $.$
  key: string
  constructor(setting: Setting, key: string, type: string) {
    this.$container = $(this.container)
    this.$container
      .addClass(setting.c('item'))
      .addClass(setting.c(`item-${type}`))
    this.key = key
  }
}

class SettingTitle extends SettingItem {
  constructor(setting: Setting, title: string) {
    super(setting, '', 'title')
    this.$container.text(title)
  }
}

class SettingSeparator extends SettingItem {
  constructor(setting: Setting) {
    super(setting, '', 'separator')
  }
}

class SettingInput extends SettingItem {
  constructor(setting: Setting, key: string, title: string) {
    super(setting, key, 'input')
    this.$container.html(
      setting.c(`<div class="title">
      ${escape(title)}
    </div>
    <div class="item-description"></div>`)
    )
  }
}

class SettingCheckbox extends SettingItem {
  constructor(
    setting: Setting,
    key: string,
    title: string,
    description?: string
  ) {
    super(setting, key, 'checkbox')

    if (!description) {
      description = title
      title = ''
    }

    this.$container.html(
      setting.c(`<div class="title">
      ${escape(title)}
    </div>
    <div class="control">
      <input type="checkbox"></input>
      <label>${escape(description)}</label>
    </div>`)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Setting)
}
