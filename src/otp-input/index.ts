import { exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'
import $ from 'licia/$'
import isNumeric from 'licia/isNumeric'
import keyCode from 'licia/keyCode'
import each from 'licia/each'
import reverse from 'licia/reverse'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Number of inputs. */
  inputNum?: number
}

/**
 * One time password input.
 */
export default class OtpInput extends Component<IOptions> {
  private activeIdx = 0
  private $activeInput: $.$
  private $inputs: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'otp-input' }, options)

    this.initOptions(options, {
      inputNum: 6,
    })

    this.initTpl()
    this.$inputs = this.$container.find('input')
    this.$activeInput = this.$inputs.eq(this.activeIdx)

    this.bindEvent()
  }
  /** Get otp value. */
  getValue() {
    let val = ''

    this.$inputs.each(function (this: HTMLInputElement) {
      const c = $(this).val()
      if (c) {
        val += c
      }
    })

    return val
  }
  private focus(idx: number) {
    ;(this.$inputs.get(idx) as HTMLInputElement).focus()
  }
  private focusNext() {
    const nextIdx = this.activeIdx + 1
    if (nextIdx < this.options.inputNum) {
      this.focus(nextIdx)
    }
  }
  private focusPrev() {
    const prevIdx = this.activeIdx - 1
    if (prevIdx >= 0) {
      this.focus(prevIdx)
    }
  }
  private initTpl() {
    const { inputNum } = this.options

    let html = ''
    for (let i = 0; i < inputNum; i++) {
      html += '<input type="text"></input>'
    }

    this.$container.html(html)
  }
  private bindEvent() {
    const self = this
    const { $inputs } = this

    this.$container
      .on('keydown', 'input', this.onKeyDown)
      .on('paste', 'input', this.onPaste)

    $inputs.each(function (this: HTMLInputElement, idx: number) {
      const input = this
      const $input = $(input)
      $input.on('focus', function () {
        input.select()
        self.$activeInput = $input
        self.activeIdx = idx
        if (idx > 0) {
          const $lastInput = $inputs.eq(idx - 1)
          if ($lastInput.val() === '') {
            self.focusPrev()
          }
        }
      })
    })
  }
  private onPaste = (e: any) => {
    e.preventDefault()
    const value: string = e.origEvent.clipboardData.getData('text')
    const valArr = value.split('').slice(0, this.options.inputNum)
    each(reverse(valArr), (char) => {
      if (isNumeric(char)) {
        this.setFocus(char, true)
      }
    })
  }
  private setFocus(val: string, insert = false) {
    const { $inputs } = this
    const { inputNum } = this.options

    if (val === '') {
      this.$activeInput.val(val)
      for (let i = this.activeIdx; i < inputNum; i++) {
        const $input = $inputs.eq(i)
        const $nextInput = $inputs.eq(i + 1)
        if ($nextInput) {
          $input.val($nextInput.val())
        } else {
          $input.val('')
        }
      }
    } else if (insert) {
      for (let i = inputNum - 1; i > this.activeIdx; i--) {
        const $input = $inputs.eq(i)
        const $prevInput = $inputs.eq(i - 1)
        $input.val($prevInput.val())
      }
      this.$activeInput.val(val)
    } else {
      this.$activeInput.val(val)
    }

    const value = this.getValue()
    this.emit('change', value)
    if (value.length === inputNum) {
      this.emit('complete', value)
    }
  }
  private onKeyDown = (e: any) => {
    const event: KeyboardEvent = e.origEvent
    if (event.ctrlKey || event.metaKey) {
      return
    }

    const { key } = event
    e.preventDefault()
    switch (event.keyCode) {
      case keyCode('backspace'):
        this.setFocus('')
        this.focusPrev()
        break
      case keyCode('delete'):
        this.setFocus('')
        break
      case keyCode('left'):
        this.focusPrev()
        break
      case keyCode('right'):
        this.focusNext()
        break
      default:
        if (isNumeric(key)) {
          this.setFocus(key)
          this.focusNext()
        }
    }
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, OtpInput)
}
