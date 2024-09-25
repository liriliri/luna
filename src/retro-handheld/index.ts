import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import types from 'licia/types'
import detectBrowser from 'licia/detectBrowser'
import LunaRetroEmulator from 'luna-retro-emulator'
import defaults from 'licia/defaults'
import each from 'licia/each'
import invert from 'licia/invert'
import contain from 'licia/contain'
import pointerEvent from 'licia/pointerEvent'
import LunaMenu from 'luna-menu'
import Component, { IComponentOptions } from '../share/Component'
import { eventClient, exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Libretro core url. */
  core: string
  /** BrowserFS url. */
  browserFS: string
  /** RetroArch config. */
  config?: string
  /** RetroArch core options. */
  coreConfig?: string
  /** Controller mapping. */
  controller: types.PlainObj<string>
}

/**
 * Retro emulator with controls ui.
 *
 * @example
 * const retroHandheld = new RetroHandheld(container, {
 *   core: 'https://luna.liriliri.io/fceumm_libretro.js',
 *   browserFS: 'https://luna.liriliri.io/browserfs.min.js',
 * })
 * retroEmulator.load('https://luna.liriliri.io/Contra.nes')
 */
export default class RetroHandheld extends Component<IOptions> {
  private $gameScreen: $.$
  private $controls: $.$
  private $gameControls: $.$
  private gameScreen: HTMLDivElement
  private retroEmulator: LunaRetroEmulator
  private menu: LunaMenu
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'retro-handheld' })

    this.initOptions(options, {
      controller: {
        start: 'Enter',
        select: 'ShiftRight',
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        a: 'KeyX',
        b: 'KeyZ',
        x: 'KeyS',
        y: 'KeyA',
      },
    })

    defaults(this.options.controller, {})

    this.initTpl()

    this.$gameScreen = this.find('.game-screen')
    this.gameScreen = this.$gameScreen.get(0) as HTMLDivElement
    this.$controls = this.find('.controls')
    this.$gameControls = this.find('.game-controls')

    if (detectBrowser().name === 'ios') {
      container.setAttribute('ontouchstart', '')
    }

    this.initEmulator()
    this.initMenu()

    this.bindEvent()
  }
  /** Load rom from url. */
  load(url: string) {
    this.retroEmulator.load(url)
  }
  private initMenu() {
    const { retroEmulator } = this
    this.menu = LunaMenu.build([
      {
        label: 'Open...',
        click() {
          retroEmulator.open()
        },
      },
      {
        label: 'Reset',
        click() {
          retroEmulator.reset()
        },
      },
      {
        label: 'Fullscreen',
        click() {
          retroEmulator.toggleFullscreen()
        },
      },
    ])
    this.addSubComponent(this.menu)
  }
  private bindEvent() {
    const { c, $controls, $gameControls } = this
    const { controller } = this.options
    const keyMap = invert(controller)

    const timers: types.PlainObj<any> = {}
    const onPressKey = (code: string, once = false) => {
      const selector = c(`.button-${keyMap[code]}`)
      const press = (e: any) => {
        $(selector).addClass(c('active'))
        this.retroEmulator.pressKey(code)
        if (!once) {
          if (e && timers[code]) {
            releaseKey(code)
          }
          timers[code] = setTimeout(press, 50)
        } else {
          setTimeout(() => {
            $(selector).rmClass(c('active'))
            this.retroEmulator.releaseKey(code)
          }, 60)
        }
      }

      return press
    }
    const onReleaseKey = (code: string) => {
      return releaseKey.bind(this, code)
    }
    const releaseKey = (code: string) => {
      const selector = c(`.button-${keyMap[code]}`)
      if (timers[code]) {
        $(selector).rmClass(c('active'))
        this.retroEmulator.releaseKey(code)
        clearTimeout(timers[code])
        delete timers[code]
      }
    }
    const bindControl = (button: string, code: string) => {
      const selector = `.button-${button}`
      if (contain(['select', 'start'], button)) {
        $gameControls.on(
          pointerEvent('down'),
          c(selector),
          onPressKey(code, true)
        )
      } else {
        $controls.on(pointerEvent('down'), c(selector), onPressKey(code))
        $controls.on(pointerEvent('up'), c(selector), onReleaseKey(code))
      }
    }

    each(controller, (key, button) => {
      bindControl(button, key)
    })

    this.$gameScreen.on('contextmenu', this.showMenu)
  }
  private showMenu = (e: any) => {
    e = e.origEvent
    e.preventDefault()
    this.menu.show(eventClient('x', e), eventClient('y', e))
  }
  private initEmulator() {
    const { core, browserFS, config, coreConfig } = this.options
    this.retroEmulator = new LunaRetroEmulator(this.gameScreen, {
      core,
      browserFS,
      config,
      coreConfig,
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

if (typeof module !== 'undefined') {
  exportCjs(module, RetroHandheld)
}
