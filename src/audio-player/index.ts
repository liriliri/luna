import { exportCjs } from '../share/util'
import Component, { IComponentOptions } from '../share/Component'

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
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'audio-player' }, options)

    this.initOptions(options, {
      url: '',
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, AudioPlayer)
}
