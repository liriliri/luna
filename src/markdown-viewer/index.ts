import Component, { IComponentOptions } from '../share/Component'
import MarkdownIt from 'markdown-it'
import $ from 'licia/$'
import h from 'licia/h'
import toNum from 'licia/toNum'
import types from 'licia/types'
import startWith from 'licia/startWith'
import LunaSyntaxHighlighter from 'luna-syntax-highlighter'
import LunaGallery from 'luna-gallery'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Markdown text to render. */
  markdown?: string
}

/**
 * Live markdown renderer.
 *
 * @example
 * const markdownViewer = new LunaMarkdownViewer(container)
 * markdownViewer.setOption({ markdown: '# h1' })
 */
export default class MarkdownViewer extends Component<IOptions> {
  private md: MarkdownIt = new MarkdownIt({
    linkify: true,
  })
  private gallery: LunaGallery
  private galleryContainer: HTMLElement = h('div')
  private onImageClick: types.AnyFn
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'markdown-viewer' }, options)

    this.initOptions(options, {
      markdown: '',
    })

    document.body.appendChild(this.galleryContainer)
    this.gallery = new LunaGallery(this.galleryContainer)

    this.bindEvent()
    this.render()
  }
  destroy() {
    this.$container.off('click', this.onImageClick)
    this.gallery.destroy()
    document.body.removeChild(this.galleryContainer)
    super.destroy()
  }
  private render() {
    const { $container, gallery } = this
    const { markdown } = this.options

    gallery.clear()
    this.destroySubComponents()

    $container.html(this.md.render(markdown))

    const $codes = $container.find('pre code')
    const self = this
    $codes.each(function (this: HTMLElement) {
      const $code = $(this)
      const className = $code.attr('class') || ''
      if (!startWith(className, 'language-')) {
        return
      }
      const language = className.replace('language-', '')
      if (!LunaSyntaxHighlighter.getLanguage(language)) {
        return
      }
      const pre = $code.parent()

      self.addSubComponent(new LunaSyntaxHighlighter(pre.get(0) as HTMLElement))
    })

    const $images = $container.find('img')
    $images.each(function (this: HTMLImageElement, idx) {
      const $img = $(this)
      $img.data('idx', idx)
      gallery.append($img.attr('src'), $img.attr('alt') || '')
    })
  }
  private bindEvent() {
    const { gallery } = this

    this.on('optionChange', (name) => {
      switch (name) {
        case 'markdown':
          this.render()
          break
      }
    })

    this.onImageClick = function (this: HTMLImageElement) {
      const $img = $(this)
      const idx = toNum($img.data('idx'))
      gallery.slideTo(idx)
      gallery.show()
    }
    this.$container.on('click', 'img', this.onImageClick)
  }
}

module.exports = MarkdownViewer
module.exports.default = MarkdownViewer
