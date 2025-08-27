import { exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'
import WaveSurfer from 'wavesurfer.js'
import stripIndent from 'licia/stripIndent'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Audio url. */
  url?: string
}

/**
 * Audio player.
 *
 * @example
 * const audioPlayer = new LunaAudioPlayer(container, { url: 'https://luna.liriliri.io/Get_along.mp3' })
 * audioPlayer.play()
 */
export default class AudioPlayer extends Component<IOptions> {
  private wavesurfer: WaveSurfer
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'audio-player' }, options)

    this.initOptions(options, {
      url: '/Get_along.mp3',
    })

    this.initTpl()

    const $wavesurfer = this.find('.wavesurfer')

    this.wavesurfer = WaveSurfer.create({
      container: $wavesurfer.get(0) as HTMLElement,
    })

    if (this.options.url) {
      this.wavesurfer.load(this.options.url)
    }
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="wavesurfer"></div>`)
    )
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, AudioPlayer)
}
