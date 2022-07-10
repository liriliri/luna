import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import { drag } from '../share/util'
import $ from 'licia/$'
import toNum from 'licia/toNum'

/** IOptions */
export interface IOptions extends IComponentOptions {}

/**
 * Virtual keyboard.
 */
export default class Keyboard extends Component<IOptions> {
  private input = ''
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'keyboard' })

    this.initOptions(options, {})

    this.initTpl()

    this.bindEvent()
  }
  setInput(input: string) {
    this.input = input
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <ul class="row">
        <li data-key="27"><span>esc</span></li>
        <li data-key="112"><span>F1</span></li>
        <li data-key="113"><span>F2</span></li>
        <li data-key="114"><span>F3</span></li>
        <li data-key="115"><span>F4</span></li>
        <li data-key="116"><span>F5</span></li>
        <li data-key="117"><span>F6</span></li>
        <li data-key="118"><span>F7</span></li>
        <li data-key="119"><span>F8</span></li>
        <li data-key="120"><span>F9</span></li>
        <li data-key="121"><span>F10</span></li>
        <li data-key="122"><span>F11</span></li>
        <li data-key="123"><span>F12</span></li>
      </ul>
      <ul class="row">
        <li data-key="192"><span>~</span><span>\`</span></li>
        <li data-key="49"><span>!</span><span>1</span></li>
        <li data-key="50"><span>@</span><span>2</span></li>
        <li data-key="51"><span>#</span><span>3</span></li>
        <li data-key="52"><span>$</span><span>4</span></li>
        <li data-key="53"><span>%</span><span>5</span></li>
        <li data-key="54"><span>^</span><span>6</span></li>
        <li data-key="55"><span>&amp;</span><span>7</span></li>
        <li data-key="56"><span>*</span><span>8</span></li>
        <li data-key="57"><span>(</span><span>9</span></li>
        <li data-key="48"><span>)</span><span>0</span></li>
        <li data-key="189"><span>＿</span><span>-</span></li>
        <li data-key="187"><span>＋</span><span>: </span></li>
        <li data-key="8"><span>&nbsp;</span><span>delete</span></li>
      </ul>
      <ul class="row">
        <li data-key="9"><span>&nbsp;</span><span>tab</span></li>
        <li data-key="81"><span>Q</span></li>
        <li data-key="87"><span>W</span></li>
        <li data-key="69"><span>E</span></li>
        <li data-key="82"><span>R</span></li>
        <li data-key="84"><span>T</span></li>
        <li data-key="89"><span>Y</span></li>
        <li data-key="85"><span>U</span></li>
        <li data-key="73"><span>I</span></li>
        <li data-key="79"><span>O</span></li>
        <li data-key="80"><span>P</span></li>
        <li data-key="219"><span>{</span><span>[</span></li>
        <li data-key="221"><span>}</span><span>]</span></li>
        <li data-key="220"><span>|</span><span>\</span></li>
      </ul>
      <ul class="row">
        <li data-key="20"><span>&nbsp;</span><span>CapsLock</span></li>
        <li data-key="65"><span>A</span></li>
        <li data-key="83"><span>S</span></li>
        <li data-key="68"><span>D</span></li>
        <li data-key="70"><span>F</span></li>
        <li data-key="71"><span>G</span></li>
        <li data-key="72"><span>H</span></li>
        <li data-key="74"><span>J</span></li>
        <li data-key="75"><span>K</span></li>
        <li data-key="76"><span>L</span></li>
        <li data-key="186"><span>:</span><span>;</span></li>
        <li data-key="222"><span>"</span><span>'</span></li>
        <li data-key="13"><span>enter</span><span>return</span></li>
      </ul>
      <ul class="row">
        <li data-key="16"><span>&nbsp;</span><span>⇧</span></li>
        <li data-key="90"><span>Z</span></li>
        <li data-key="88"><span>X</span></li>
        <li data-key="67"><span>C</span></li>
        <li data-key="86"><span>V</span></li>
        <li data-key="66"><span>B</span></li>
        <li data-key="78"><span>N</span></li>
        <li data-key="77"><span>M</span></li>
        <li data-key="188"><span>&lt;</span><span>,</span></li>
        <li data-key="190"><span>&gt;</span><span>.</span></li>
        <li data-key="191"><span>?</span><span>/</span></li>
        <li data-key="16"><span>&nbsp;</span><span>⇧</span></li>
      </ul>
      <ul class="row">
        <li data-key="17"><span>&nbsp;</span><span>control</span></li>
        <li data-key="91"><span>&nbsp;</span><span>command</span></li>
        <li data-key="18"><span>alt</span><span>option</span></li>
        <li data-key="32"><span></span></li>
        <li data-key="18"><span>alt</span><span>option</span></li>
        <li data-key="93"><span>&nbsp;</span><span>command</span></li>
        <li data-key="37"><span>◀</span></li>
        <li>
          <ul>
            <li data-key="38"><span>▲</span></li>
            <li data-key="40"><span>▼</span></li>
          </ul>
        </li>
        <li data-key="39"><span>▶</span></li>
      </ul>
      `)
    )
  }
  private bindEvent() {
    const self = this
    this.find('.row').on(drag('start'), 'li', function (this: HTMLLIElement) {
      const $li = $(this)
      if (!$li.data('key')) {
        return
      }
      const key = toNum($li.data('key'))
      let input = self.input
      switch (key) {
        case 8:
          if (input.length > 0) {
            input = input.slice(0, input.length - 1)
          }
          break
        default:
          input += String.fromCharCode(key)
      }
      self.input = input
      self.emit('change', self.input)
    })
  }
}

module.exports = Keyboard
module.exports.default = Keyboard
