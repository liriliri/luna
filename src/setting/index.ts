import $ from 'licia/$'
import h from 'licia/h'
import Component from '../share/Component'
import { exportCjs } from '../share/util'

/**
 * Settings panel.
 */
export default class Setting extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'setting' })
  }
  appendTitle(key: string, title: string) {
    const settingTitle = new SettingTitle(this, key, title)
    this.append(settingTitle)
  }
  appendInput(key: string, title: string) {
    const settingInput = new SettingInput(this, key, title)
    this.append(settingInput)
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
  constructor(setting: Setting, key: string, title: string) {
    super(setting, key, 'title')
    this.$container.text(title)
  }
}

class SettingInput extends SettingItem {
  constructor(setting: Setting, key: string, title: string) {
    super(setting, key, 'input')
    this.$container.html(setting.c(`<div class="item-title">${title}</div>`))
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Setting)
}
