import Component, { IComponentOptions } from '../share/Component'
import LunaTextViewer from 'luna-text-viewer'
import { exportCjs } from '../share/util'
import ansiToHtml from './ansiToHtml'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Log to display. */
  log?: string
  /** Wrap lone lines. */
  wrapLongLines?: boolean
  /** Max viewer height. */
  maxHeight?: number
}

/**
 * Terminal log viewer.
 *
 * @example
 * const log = new LunaLog(container)
 * log.setOption({
 *   log: 'npm install',
 * })
 */
export default class Log extends Component {
  private textViewer: LunaTextViewer
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'log' }, options)

    this.initOptions(options, {
      log: '',
      wrapLongLines: true,
      maxHeight: Infinity,
    })

    this.textViewer = new LunaTextViewer(container, {
      text: ansiToHtml(this.options.log),
      escape: false,
      showLineNumbers: false,
      wrapLongLines: this.options.wrapLongLines,
      maxHeight: this.options.maxHeight,
    })
    this.addSubComponent(this.textViewer)

    this.bindEvent()
  }
  /** Append log. */
  append(log: string) {
    this.options.log += log
    this.textViewer.append(ansiToHtml(log))
  }
  private bindEvent() {
    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'log':
          this.textViewer.setOption('text', val)
          break
        case 'wrapLongLines':
        case 'maxHeight':
          this.textViewer.setOption(name, val)
          break
      }
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, Log)
}
