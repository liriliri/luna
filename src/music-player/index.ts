import $ from 'licia/$'
import stripIndent from 'licia/stripIndent'
import { classPrefix } from '../share/util'

const c = classPrefix('music-player')

export = class MusicPlayer {
  private $container: $.$
  private $body: $.$
  constructor(container: Element) {
    const $container = $(container)
    $container.addClass('luna-music-player')
    this.$container = $container

    this.$body = $container.find(`.${c('body')}`)

    this.appendTpl()
  }
  destroy() {
    this.$container.rmClass('luna-music-player')
    this.$container.html('')
  }
  private appendTpl() {
    this.$container.html(stripIndent`
      <div class="${c('body')}">
        <div class="${c('body-left')}"></div>
        <div class="${c('body-right')}">
          <div class="${c('info')}">
            <span class="${c('title')}"></span>
            <span class="${c('author')}"></span>
          </div>
          <div class="${c('controller')}">
            <div class="${c('controller-left')}">
              <div class="${c('bar')}"></div>
            </div>
            <div class="${c('controller-right')}">
            </div>
          </div>
        </div>
      </div>
      <div class="${c('list')}"></div>
    `)
  }
}
