import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import LunaRetroEmulator from 'luna-retro-emulator'
import Component from '../share/Component'

/**
 * Retro emulator with controls ui.
 */
export default class RetroHandheld extends Component {
  private $gameScreen: $.$
  private gameScreen: HTMLDivElement
  private retroEmulator: LunaRetroEmulator
  constructor(container: HTMLElement) {
    super(container, { compName: 'retro-handheld' })

    this.initTpl()

    this.$gameScreen = this.find('.game-screen')
    this.gameScreen = this.$gameScreen.get(0) as HTMLDivElement

    this.initEmulator()
  }
  private initEmulator() {
    this.retroEmulator = new LunaRetroEmulator(this.gameScreen, {
      core: 'https://res.liriliri.io/luna/fceumm_libretro.js',
      browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="gameboy">
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
            <div class="cursor up"></div>
            <div class="cursor left"></div>
            <div class="cursor center">
              <div class="circle"></div>
            </div>
            <div class="cursor right"></div>
            <div class="cursor down"></div>
          </div>
          <div class="buttons">
            <div class="button B" data-button="B"></div>
            <div class="button A" data-button="A"></div>
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
          <div class="gamecontrols">
            <div class="gap"><div class="button select" data-button="SELECT"></div></div>
            <div class="gap"><div class="button start"  data-button="START"></div></div>
          </div>    
        </div>
      </div>
      `)
    )
  }
}

module.exports = RetroHandheld
module.exports.default = RetroHandheld
