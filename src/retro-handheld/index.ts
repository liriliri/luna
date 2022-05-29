import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import types from 'licia/types'
import detectBrowser from 'licia/detectBrowser'
import LunaRetroEmulator from 'luna-retro-emulator'
import Component from '../share/Component'
import { drag } from '../share/util'

/**
 * Retro emulator with controls ui.
 */
export default class RetroHandheld extends Component {
  private $gameScreen: $.$
  private $controls: $.$
  private $gameControls: $.$
  private gameScreen: HTMLDivElement
  private retroEmulator: LunaRetroEmulator
  constructor(container: HTMLElement) {
    super(container, { compName: 'retro-handheld' })

    this.initTpl()

    this.$gameScreen = this.find('.game-screen')
    this.gameScreen = this.$gameScreen.get(0) as HTMLDivElement
    this.$controls = this.find('.controls')
    this.$gameControls = this.find('.game-controls')

    if (detectBrowser().name === 'ios') {
      container.setAttribute('ontouchstart', '')
    }

    this.initEmulator()

    this.bindEvent()
  }
  /** Load rom from url. */
  load(url: string) {
    this.retroEmulator.load(url)
  }
  private triggerKeyboardEvent(type: string, code: string) {
    this.retroEmulator.triggerEvent(
      type,
      new KeyboardEvent(type, {
        code,
      })
    )
  }
  private bindEvent() {
    const { c } = this

    const timers: types.PlainObj<any> = {}
    const pressKey = (code: string, once = false) => {
      const press = () => {
        this.triggerKeyboardEvent('keydown', code)
        if (!once) {
          timers[code] = setTimeout(press, 50)
        } else {
          setTimeout(() => {
            this.triggerKeyboardEvent('keyup', code)
          }, 60)
        }
      }

      return press
    }
    const releaseKey = (code: string) => {
      return () => {
        if (timers[code]) {
          this.triggerKeyboardEvent('keyup', code)
          clearTimeout(timers[code])
          delete timers[code]
        }
      }
    }
    const bindControl = (selector: string, code: string) => {
      this.$controls.on(drag('start'), c(selector), pressKey(code))
      this.$controls.on(drag('end'), c(selector), releaseKey(code))
    }

    this.$gameControls
      .on('click', c('.button-start'), pressKey('Enter', true))
      .on('click', c('.button-select'), pressKey('ShiftRight', true))

    bindControl('.button-up', 'ArrowUp')
    bindControl('.button-down', 'ArrowDown')
    bindControl('.button-left', 'ArrowLeft')
    bindControl('.button-right', 'ArrowRight')
    bindControl('.button-a', 'KeyX')
    bindControl('.button-b', 'KeyZ')
    bindControl('.button-x', 'KeyS')
    bindControl('.button-y', 'KeyA')
  }
  private initEmulator() {
    this.retroEmulator = new LunaRetroEmulator(this.gameScreen, {
      core: 'https://res.liriliri.io/luna/fceumm_libretro.js',
      browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
      controls: false,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="top">
        <div class="corner left"></div>
        <div class="top"></div>
        <div class="corner right"></div>
      </div>
      <div class="screen">
        <div class="game-screen"></div>
      </div>
      <div class="controls">
        <div class="cross">
          <div class="cursor up button-up"></div>
          <div class="cursor left button-left"></div>
          <div class="cursor center">
            <div class="circle"></div>
          </div>
          <div class="cursor right button-right"></div>
          <div class="cursor down button-down"></div>
        </div>
        <div class="button-container">
          <div class="buttons">
            <div class="button button-y" data-button="Y"></div>
            <div class="button button-x" data-button="X"></div>
          </div>
          <div class="buttons">
            <div class="button button-b" data-button="B"></div>
            <div class="button button-a" data-button="A"></div>
          </div>
        </div>
      </div>
      <div class="speaker">
        <div class="band"></div>
        <div class="band"></div>
        <div class="band"></div>
        <div class="band"></div>
        <div class="band"></div>
        <div class="band"></div>
      </div>
      <div class="bottom">
        <div class="game-controls">
          <div class="gap"><div class="button button-select" data-button="SELECT"></div></div>
          <div class="gap"><div class="button button-start"  data-button="START"></div></div>
        </div>    
      </div>
      `)
    )
  }
}

module.exports = RetroHandheld
module.exports.default = RetroHandheld
