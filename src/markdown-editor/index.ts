import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import LunaMarkdownViewer from 'luna-markdown-viewer'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Initial markdown text. */
  markdown?: string
}

/**
 * Markdown editor with preview.
 *
 * @example
 * const markdownEditor = new LunaMarkdownEditor(container)
 */
export default class MarkdownEditor extends Component<IOptions> {
  private $textarea: $.$
  private textarea: HTMLTextAreaElement
  private $toolbar: $.$
  private $preview: $.$
  private $fullscreen: $.$
  private $previewContainer: $.$
  private markdownViewer: LunaMarkdownViewer
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'markdown-editor' }, options)

    this.initOptions(options, {
      markdown: '',
    })

    this.initTpl()

    this.$textarea = this.find('.textarea')
    this.$textarea.val(this.options.markdown)
    this.textarea = this.$textarea.get(0) as HTMLTextAreaElement
    this.$toolbar = this.find('.toolbar')
    this.$preview = this.find('.preview')
    this.$previewContainer = this.find('.preview-container')
    this.$fullscreen = this.find('.fullscreen')

    const $markdownViewer = this.find('.markdown-viewer')
    this.markdownViewer = new LunaMarkdownViewer(
      $markdownViewer.get(0) as HTMLElement
    )
    this.addSubComponent(this.markdownViewer)

    this.bindEvent()
  }
  /** Get or set markdown text. */
  markdown(markdown?: string) {
    if (markdown) {
      this.$textarea.val(markdown)
    } else {
      return this.$textarea.val()
    }
  }
  private wrapText = (chars: string) => {
    const [start, end] = this.getCursorPos()
    const markdown = this.markdown() as string
    const noSelection = start === end

    let newMarkdown = `${chars}${noSelection ? '' : markdown.slice(start, end)}${chars}`
    newMarkdown = `${markdown.slice(0, start)}${newMarkdown}${markdown.slice(end)}`
    this.markdown(newMarkdown)

    if (noSelection) {
      this.setCursorPos(start + chars.length)
    } else {
      this.setSelection(start + chars.length, end + chars.length)
    }
  }
  private setSelection(start: number, end: number) {
    this.focus()
    this.textarea.setSelectionRange(start, end)
  }
  private focus() {
    const { textarea } = this
    const { scrollTop } = textarea

    textarea.focus()
    textarea.scrollTop = scrollTop
  }
  private setCursorPos(pos: number) {
    this.focus()
    this.textarea.selectionEnd = pos
  }
  private getCursorPos() {
    const { textarea } = this

    return  [textarea.selectionStart, textarea.selectionEnd]
  }
  private bindEvent() {
    const { c } = this

    this.$toolbar
      .on('click', c('.preview'), this.togglePreview)
      .on('click', c('.bold'), () => this.wrapText('**'))
      .on('click', c('.italic'), () => this.wrapText('_'))
      .on('click', c('.fullscreen'), this.toggleFullscreen)
  }
  private toggleFullscreen = () => {
    const { $fullscreen, c } = this
    const isFullscreen = $fullscreen.hasClass(c('active'))
    if (isFullscreen) {
      this.$container.rmClass(c('fullscreen'))
    } else {
      this.$container.addClass(c('fullscreen'))
    }
    $fullscreen.toggleClass(c('active'))
  }
  private togglePreview = () => {
    const { $preview, c, $previewContainer } = this
    const isPreviewing = $preview.hasClass(c('active'))
    if (isPreviewing) {
      $previewContainer.addClass(c('hidden'))
    } else {
      this.markdownViewer.setOption('markdown', this.markdown())
      $previewContainer.rmClass(c('hidden'))
    }
    $preview.toggleClass(c('active'))
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="toolbar">
          <button class="button preview">
            <span class="icon icon-eye"></span>
          </button>
          <button class="button bold">
            <span class="icon icon-bold"></span>
          </button>
          <button class="button italic">
            <span class="icon icon-italic"></span>
          </button>
          <button class="button fullscreen">
            <span class="icon icon-fullscreen"></span>
          </button>
        </div>
        <div class="body">
          <textarea class="textarea"></textarea>
          <div class="preview-container hidden">
            <div class="markdown-viewer"><div>
          </div>
        </div>
      `)
    )
  }
}

module.exports = MarkdownEditor
module.exports.default = MarkdownEditor
