import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import $ from 'licia/$'
import h from 'licia/h'
import map from 'licia/map'
import filter from 'licia/filter'
import isShadowRoot from 'licia/isShadowRoot'
import stripIndent from 'licia/stripIndent'
import toArr from 'licia/toArr'
import MutationObserver from 'licia/MutationObserver'
import contain from 'licia/contain'
import highlight from 'licia/highlight'
import truncate from 'licia/truncate'
import last from 'licia/last'
import types from 'licia/types'
import escape from 'licia/escape'
import trim from 'licia/trim'
import every from 'licia/every'
import hotkey from 'licia/hotkey'
import lowerCase from 'licia/lowerCase'
import { exportCjs, getPlatform, hasTouchSupport } from '../share/util'

const emptyHighlightStyle = {
  comment: '',
  string: '',
  number: '',
  keyword: '',
  operator: '',
}

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Html element to navigate. */
  node?: ChildNode
  /** Predicate function which removes the matching child nodes. */
  ignore?: types.AnyFn
  /** Predicate function which removes the matching node attributes. */
  ignoreAttr?: types.AnyFn
  /** Enable hotkey. */
  hotkey?: boolean
  /** Observe dom mutation. */
  observe?: boolean
  /** Whether to convert tag name to lower case. */
  lowerCaseTagName?: boolean
  parent?: DomViewer | null
  isEndTag?: boolean
  rootContainer?: HTMLElement
  rootDomViewer?: DomViewer
}

/**
 * Dom tree navigator.
 *
 * @example
 * const container = document.getElementById('container')
 * const domViewer = new LunaDomViewer(container)
 * domViewer.expand()
 */
export default class DomViewer extends Component<IOptions> {
  isExpanded = false
  childNodes: ChildNode[] = []
  childNodeDomViewers: DomViewer[] = []
  endTagDomViewer?: DomViewer
  private $tag: $.$
  private $children: $.$
  private observer: MutationObserver
  private isShadowRoot: boolean
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'dom-viewer' }, options)

    this.initOptions(options, {
      node: document.documentElement,
      parent: null,
      isEndTag: false,
      observe: true,
      rootContainer: container,
      rootDomViewer: this,
      ignore: () => false,
      ignoreAttr: () => false,
      lowerCaseTagName: true,
      hotkey: true,
    })

    this.isShadowRoot = isShadowRoot(this.options.node)

    this.initTpl()
    this.bindEvent()
    if (!this.options.isEndTag && this.options.observe) {
      this.initObserver()
    }
  }
  /** Select given node. */
  select(node?: ChildNode) {
    const { c, options } = this

    if (!node || (node && options.node === node)) {
      if (this.$tag.hasClass(c('selected'))) {
        return
      }
      $(this.options.rootContainer)
        .find(c('.selected'))
        .rmClass(c('selected'))
        .rmAttr('tabindex')
      ;(this.$tag.attr('tabindex', '0').get(0) as HTMLElement).focus()
      this.$tag.addClass(c('selected'))
      options.rootDomViewer.emit('select', options.node)
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    let childNode = node
    let curNode = node.parentElement
    while (curNode) {
      if (curNode === options.node) {
        this.expand()
        const childNodeDomViewer =
          this.childNodeDomViewers[this.childNodes.indexOf(childNode)]
        childNodeDomViewer.select(node)
        break
      }
      childNode = curNode
      curNode = curNode.parentElement
    }
  }
  attach() {
    this.container.appendChild(this.$tag.get(0))
    if (this.$children) {
      this.container.appendChild(this.$children.get(0))
    }
  }
  isAttached() {
    return !!this.$tag.get(0).parentNode
  }
  detach() {
    this.$tag.remove()
    if (this.$children) {
      this.$children.remove()
    }
  }
  expand = (recursive = false) => {
    if (!this.isExpandable()) {
      return
    }

    if (!this.isExpanded) {
      this.isExpanded = true
      this.renderExpandTag()
      this.renderChildNodes()
    }

    if (recursive) {
      each(this.childNodeDomViewers, (domViewer) => {
        domViewer.expand(true)
      })
    }
  }
  collapse = (recursive = false) => {
    if (!this.isExpandable()) {
      return
    }

    if (this.isExpanded) {
      this.isExpanded = false
      this.renderCollapseTag()
    }

    if (recursive) {
      each(this.childNodeDomViewers, (domViewer) => {
        domViewer.collapse(true)
      })
    }
  }
  toggle = () => {
    if (this.isExpanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }
  destroy() {
    const { c } = this

    if (this.$tag.hasClass(c('selected'))) {
      this.options.rootDomViewer.emit('deselect')
    }
    this.detach()
    if (this.observer) {
      this.observer.disconnect()
    }
    this.destroySubComponents()

    if (this.options.rootDomViewer === this) {
      this.$container
        .rmClass(`luna-dom-viewer`)
        .rmClass(c(`platform-${getPlatform()}`))
        .rmClass(c(`theme-${this.options.theme}`))
    }

    this.emit('destroy')
    this.removeAllListeners()
  }
  private renderExpandTag() {
    const { $tag, c } = this
    const { node } = this.options

    if (!this.isShadowRoot) {
      $tag.html(
        this.renderHtmlTag({
          ...getHtmlTagData(node as HTMLElement),
          hasTail: false,
          hasToggleButton: true,
        })
      )
    }
    $tag.addClass(c('expanded'))
    this.$children.rmClass(c('hidden'))
  }
  private renderCollapseTag() {
    const { $tag, c } = this
    const { node } = this.options

    this.$children.addClass(c('hidden'))
    if (!this.isShadowRoot) {
      this.$tag.html(
        this.renderHtmlTag({
          ...getHtmlTagData(node as HTMLElement),
          hasTail: true,
          hasToggleButton: true,
        })
      )
    }
    $tag.rmClass(c('expanded'))
  }
  private initObserver() {
    this.observer = new MutationObserver((mutations) => {
      each(mutations, (mutation) => {
        this.handleMutation(mutation)
      })
    })
    this.observer.observe(this.options.node, {
      attributes: true,
      childList: true,
      characterData: true,
    })
  }
  private handleMutation(mutation: MutationRecord) {
    const { $tag, c } = this
    const { node, ignore } = this.options

    if (contain(['attributes', 'childList'], mutation.type)) {
      if (mutation.type === 'childList') {
        if (
          every(mutation.addedNodes, ignore) &&
          every(mutation.removedNodes, ignore)
        ) {
          return
        }
        this.renderChildNodes()
      }

      if (this.isExpandable()) {
        this.isExpanded ? this.renderExpandTag() : this.renderCollapseTag()
      } else {
        this.$children.addClass(c('hidden'))
        this.isExpanded = false
        if (this.isShadowRoot) {
          $tag.html(this.renderShadowRoot(false))
        } else {
          $tag.html(
            this.renderHtmlTag({
              ...getHtmlTagData(node as HTMLElement),
              hasTail: false,
            })
          )
        }
      }
    } else if (mutation.type === 'characterData') {
      if (node.nodeType === Node.TEXT_NODE) {
        $tag.html(this.renderTextNode(node))
      } else if (node.nodeType === Node.COMMENT_NODE) {
        $tag.html(this.renderHtmlComment(node.nodeValue as string))
      }
    }
  }
  private bindEvent() {
    const { c, $tag } = this
    const { node } = this.options

    if (node.nodeType === Node.ELEMENT_NODE || this.isShadowRoot) {
      $tag.on('click', c('.toggle'), (e: any) => {
        e.stopPropagation()
        this.toggle()
      })
    }

    if (hasTouchSupport) {
      $tag.on('click', () => this.select())
    } else {
      $tag.on('mousedown', () => this.select())
    }

    if (this.options.hotkey) {
      const options = { element: $tag.get(0) as HTMLElement }
      hotkey.on('right', options, this.onKeyRight)
      hotkey.on('left', options, this.onKeyLeft)
      hotkey.on('down', options, this.onKeyDown)
      hotkey.on('up', options, this.onKeyUp)
    }
  }
  private onKeyRight = () => {
    if (this.isExpanded) {
      this.childNodeDomViewers[0].select()
    } else {
      this.expand()
    }
  }
  private onKeyLeft = () => {
    if (this.isExpanded) {
      this.collapse()
    } else {
      this.options.parent?.select()
    }
  }
  private onKeyDown = () => {
    const { options } = this

    if (this.isExpanded) {
      this.childNodeDomViewers[0].select()
      return
    }

    let { parent } = options
    if (!parent) {
      return
    }

    if (options.isEndTag) {
      parent = parent.getOption('parent')
      if (!parent) {
        return
      }

      const { childNodes, childNodeDomViewers, endTagDomViewer } = parent
      const idx = childNodes.indexOf(options.node)
      if (childNodes[idx + 1]) {
        childNodeDomViewers[idx + 1].select()
      } else if (endTagDomViewer) {
        endTagDomViewer.select()
      }
    } else {
      const { childNodeDomViewers, endTagDomViewer } = parent
      const idx = childNodeDomViewers.indexOf(this)
      if (childNodeDomViewers[idx + 1]) {
        childNodeDomViewers[idx + 1].select()
      } else if (endTagDomViewer) {
        endTagDomViewer.select()
      }
    }
  }
  private onKeyUp = () => {
    const { options } = this

    const parent = options.parent
    if (!parent) {
      return
    }

    let domViewer
    if (options.isEndTag) {
      domViewer = last(parent.childNodeDomViewers)
    } else {
      const idx = parent.childNodeDomViewers.indexOf(this)
      if (idx < 1) {
        parent.select()
      } else {
        domViewer = parent.childNodeDomViewers[idx - 1]
      }
    }

    if (domViewer) {
      if (domViewer.isExpanded) {
        domViewer.endTagDomViewer?.select()
      } else {
        domViewer.select()
      }
    }
  }
  private isExpandable() {
    const { node } = this.options

    if (node.nodeType !== Node.ELEMENT_NODE && !this.isShadowRoot) {
      return false
    }

    return this.getChildNodes().length > 0
  }
  private getChildNodes() {
    const { rootContainer, ignore } = this.options
    const node = this.options.node as HTMLElement
    let childNodes = toArr(node.childNodes)
    childNodes = filter(childNodes, (child) => {
      if (
        child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.COMMENT_NODE
      ) {
        const value = child.nodeValue
        if (trim(value) === '') {
          return false
        }
      }
      return child !== rootContainer && !ignore(child)
    })
    if (node.shadowRoot) {
      childNodes.unshift(node.shadowRoot)
    } else if ((node as any).chobitsuShadowRoot) {
      childNodes.unshift((node as any).chobitsuShadowRoot)
    }
    return childNodes
  }
  private initTpl() {
    const { container, c } = this
    const { node, isEndTag, lowerCaseTagName } = this.options

    const $tag = $(h('li'))
    $tag.addClass(c('tree-item'))
    this.$tag = $tag

    if (isEndTag) {
      let tagName = (node as HTMLElement).tagName
      if (lowerCaseTagName) {
        tagName = lowerCase(tagName)
      }
      $tag.html(
        c(
          `<span class="html-tag" style="margin-left: -15px;">&lt;<span class="tag-name">/${tagName}</span>&gt;</span><span class="selection"></span>`
        )
      )
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const isExpandable = this.isExpandable()
      const data = {
        ...getHtmlTagData(node as HTMLElement),
        hasTail: isExpandable,
        hasToggleButton: isExpandable,
      }
      $tag.html(this.renderHtmlTag(data))
    } else if (isShadowRoot(node)) {
      const isExpandable = this.isExpandable()
      $tag.html(this.renderShadowRoot(isExpandable))
    } else if (node.nodeType === Node.TEXT_NODE) {
      $tag.html(this.renderTextNode(node))
    } else if (node.nodeType === Node.COMMENT_NODE) {
      const value = node.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderHtmlComment(value))
    } else {
      return
    }

    container.appendChild($tag.get(0))

    if (node.nodeType === node.ELEMENT_NODE || this.isShadowRoot) {
      const $children = $(h('ul'))
      $children.addClass([c('children'), c('hidden')])
      container.appendChild($children.get(0))
      this.$children = $children
    }
  }
  private renderChildNodes() {
    const node = this.options.node as HTMLElement

    const {
      rootContainer,
      ignore,
      ignoreAttr,
      rootDomViewer,
      observe,
      lowerCaseTagName,
    } = this.options
    const $container = this.$children
    const container = $container.get(0)
    const oldChildNodes = this.childNodes
    const oldChildNodeDomViewers = this.childNodeDomViewers

    each(oldChildNodeDomViewers, (domViewer) => {
      domViewer.detach()
      this.removeSubComponent(domViewer)
    })
    if (this.endTagDomViewer) {
      this.endTagDomViewer.detach()
    }

    const childNodes = this.getChildNodes()
    this.childNodes = childNodes
    const childNodeDomViewers: DomViewer[] = []
    this.childNodeDomViewers = childNodeDomViewers
    each(childNodes, (node, idx) => {
      const pos = oldChildNodes.indexOf(node)
      let domViewer: DomViewer
      if (pos > -1) {
        domViewer = oldChildNodeDomViewers[pos]
      } else {
        domViewer = new DomViewer(container as HTMLElement, {
          node,
          observe,
          parent: this,
          rootContainer,
          rootDomViewer,
          ignore,
          ignoreAttr,
          lowerCaseTagName,
        })
      }
      domViewer.attach()
      childNodeDomViewers[idx] = domViewer
      this.addSubComponent(domViewer)
    })

    each(oldChildNodeDomViewers, (domViewer) => {
      if (!domViewer.isAttached()) {
        domViewer.destroy()
      }
    })

    if (node && !this.isShadowRoot) {
      if (this.endTagDomViewer) {
        this.endTagDomViewer.attach()
      } else {
        this.endTagDomViewer = new DomViewer(container as HTMLElement, {
          node,
          parent: this,
          isEndTag: true,
          lowerCaseTagName,
          rootContainer,
          rootDomViewer,
          ignore,
        })
        this.addSubComponent(this.endTagDomViewer)
      }
    }
  }
  private renderHtmlTag(data: IHtmlTagData) {
    const { lowerCaseTagName } = this.options

    data.attributes = filter(data.attributes, (attribute) => {
      return !this.options.ignoreAttr(data.el, attribute.name, attribute.value)
    })
    const attributes = map(data.attributes, (attribute) => {
      const { name, value, isLink } = attribute

      return `<span class="attribute">
          <span class="attribute-name">${escape(name)}</span>${
        value
          ? `="<span class="attribute-value${
              isLink ? ' attribute-underline' : ''
            }">${escape(value)}</span>"`
          : ''
      }</span>`
    }).join('')

    let tail = ''
    let tagName = data.tagName
    if (lowerCaseTagName) {
      tagName = lowerCase(tagName)
    }
    if (data.hasTail) {
      tail = `${
        data.hasTail ? '…' : ''
      }<span class="html-tag">&lt;<span class="tag-name">/${tagName}</span>&gt;</span>`
    } else if (!this.isExpandable()) {
      tail = `<span class="html-tag">&lt;<span class="tag-name">/${tagName}</span>&gt;</span>`
    }

    return this.c(stripIndent`
      ${data.hasToggleButton ? this.renderToggle() : ''}
      <span class="html-tag">&lt;<span class="tag-name">${tagName}</span>${attributes}&gt;</span>${tail}
      <span class="selection"></span>`)
  }
  private renderTextNode(node: ChildNode) {
    const { c } = this
    const value = node.nodeValue as string

    const parent = node.parentElement
    const prepend = '<span class="text-node">'
    const append = '</span><span class="selection"></span>'

    if (parent && value.length < 10000) {
      if (parent.tagName === 'STYLE') {
        return c(
          `${prepend}${highlight(value, 'css', emptyHighlightStyle)}${append}`
        )
      } else if (parent.tagName === 'SCRIPT') {
        return c(
          `${prepend}${highlight(value, 'js', emptyHighlightStyle)}${append}`
        )
      }
    }

    return c(
      `"${prepend}${escape(
        truncate(value, 10000, {
          separator: ' ',
          ellipsis: '…',
        })
      )}${append}"`
    )
  }
  private renderHtmlComment(value: string) {
    return this.c(
      `<span class="html-comment">&lt;!-- ${escape(
        value
      )} --&gt;</span><span class="selection"></span>`
    )
  }
  private renderShadowRoot(hasToggle: boolean) {
    const { node } = this.options

    return this.c(stripIndent`
      ${hasToggle ? this.renderToggle() : ''}
      <span class="shadow-root">#shadow-root (${(node as any).mode})</span>
      <span class="selection"></span>`)
  }
  private renderToggle() {
    return '<div class="toggle "><span class="icon icon-caret-right"></span><span class="icon icon-caret-down"></span></div>'
  }
}

interface IAttribute {
  name: string
  value: string
  isLink?: boolean
}

interface IBasicHtmlTagData {
  tagName: string
  attributes: IAttribute[]
}

interface IHtmlTagData extends IBasicHtmlTagData {
  el: HTMLElement
  text?: string
  hasTail?: boolean
  hasToggleButton?: boolean
}

function getHtmlTagData(el: HTMLElement) {
  const ret: IHtmlTagData = {
    el,
    tagName: '',
    attributes: [],
  }

  ret.tagName = el.tagName
  const attributes: IAttribute[] = []
  each(el.attributes, (attribute) => {
    const { name, value } = attribute
    attributes.push({
      name,
      value,
      isLink: isUrlAttribute(el, name),
    })
  })
  ret.attributes = attributes

  return ret
}

function isUrlAttribute(el: HTMLElement, name: string) {
  const tagName = el.tagName
  if (
    tagName === 'SCRIPT' ||
    tagName === 'IMAGE' ||
    tagName === 'IMG' ||
    tagName === 'VIDEO' ||
    tagName === 'AUDIO'
  ) {
    if (name === 'src') return true
  }

  if (tagName === 'LINK') {
    if (name === 'href') return true
  }

  return false
}

if (typeof module !== 'undefined') {
  exportCjs(module, DomViewer)
}
