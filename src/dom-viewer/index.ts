import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import $ from 'licia/$'
import h from 'licia/h'
import map from 'licia/map'
import filter from 'licia/filter'
import stripIndent from 'licia/stripIndent'
import toArr from 'licia/toArr'
import MutationObserver from 'licia/MutationObserver'
import contain from 'licia/contain'
import highlight from 'licia/highlight'
import truncate from 'licia/truncate'
import types from 'licia/types'
import escape from 'licia/escape'
import trim from 'licia/trim'
import every from 'licia/every'
import { exportCjs, drag } from '../share/util'

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
  private $tag: $.$
  private $children: $.$
  private isExpanded = false
  private isChildNodesRendered = false
  private observer: MutationObserver
  private childNodeDomViewers: DomViewer[] = []
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'dom-viewer' }, options)

    this.initOptions(options, {
      node: document.documentElement,
      parent: null,
      isEndTag: false,
      rootContainer: container,
      rootDomViewer: this,
      ignore: () => false,
    })

    this.initTpl()
    this.bindEvent()
    if (!this.options.isEndTag) {
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

    const childNodes = this.getChildNodes()
    let childNode = node
    let curNode = node.parentElement
    while (curNode) {
      if (curNode === options.node) {
        this.expand()
        const childNodeDomViewer =
          this.childNodeDomViewers[childNodes.indexOf(childNode)]
        childNodeDomViewer.select(node)
        break
      }
      childNode = curNode
      curNode = curNode.parentElement
    }
  }
  expand() {
    if (!this.isExpandable() || this.isExpanded) {
      return
    }
    this.isExpanded = true

    const { $tag, c } = this
    const { node } = this.options

    $tag.html(
      this.renderHtmlTag({
        ...getHtmlTagData(node as HTMLElement),
        hasTail: false,
        hasToggleButton: true,
      })
    )
    $tag.addClass(c('expanded'))
    this.$children.rmClass(c('hidden'))

    this.renderChildNodes()
  }
  collapse() {
    if (!this.isExpandable() || !this.isExpanded) {
      return
    }
    this.isExpanded = false

    const { $tag, c } = this
    const { node } = this.options

    this.$children.addClass(c('hidden'))
    this.$tag.html(
      this.renderHtmlTag({
        ...getHtmlTagData(node as HTMLElement),
        hasTail: true,
        hasToggleButton: true,
      })
    )
    $tag.rmClass(c('expanded'))
  }
  toggle = () => {
    if (this.isExpanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.childNodeDomViewers = []
    super.destroy()
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
        this.isChildNodesRendered = false
      }

      if (this.isExpandable()) {
        if (this.isExpanded) {
          this.isExpanded = false
          this.expand()
        } else {
          this.isExpanded = true
          this.collapse()
        }
      } else {
        this.$children.addClass(c('hidden'))
        $tag.html(
          this.renderHtmlTag({
            ...getHtmlTagData(node as HTMLElement),
            hasTail: false,
          })
        )
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

    if (node.nodeType === Node.ELEMENT_NODE) {
      $tag.on('click', c('.toggle'), (e: any) => {
        e.stopPropagation()
        this.toggle()
      })
    }

    $tag.on(drag('start'), () => this.select())
  }
  private isExpandable() {
    const { node } = this.options

    return (
      node.nodeType === Node.ELEMENT_NODE && this.getChildNodes().length > 0
    )
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
    return childNodes
  }
  private initTpl() {
    const { container, c } = this
    const { node, isEndTag } = this.options

    const $tag = $(h('li'))
    $tag.addClass(c('tree-item'))
    this.$tag = $tag

    if (isEndTag) {
      $tag.html(
        c(
          `<span class="html-tag" style="margin-left: -12px;">&lt;<span class="tag-name">/${(
            node as HTMLElement
          ).tagName.toLocaleLowerCase()}</span>&gt;</span><span class="selection"></span>`
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

    if (node.nodeType === node.ELEMENT_NODE) {
      const $children = $(h('ul'))
      $children.addClass([c('children'), c('hidden')])
      container.appendChild($children.get(0))
      this.$children = $children
    }
  }
  private renderChildNodes() {
    const node = this.options.node as HTMLElement
    if (this.isChildNodesRendered) {
      return
    }
    this.isChildNodesRendered = true

    this.destroySubComponents()
    const { rootContainer, ignore, rootDomViewer } = this.options
    const $container = this.$children
    const container = $container.get(0)

    const childNodes = this.getChildNodes()
    each(childNodes, (node, idx) => {
      const domViewer = new DomViewer(container as HTMLElement, {
        node,
        parent: this,
        rootContainer,
        rootDomViewer,
        ignore,
      })
      this.childNodeDomViewers[idx] = domViewer
      this.addSubComponent(domViewer)
    })

    if (node) {
      this.addSubComponent(
        new DomViewer(container as HTMLElement, {
          node,
          parent: this,
          isEndTag: true,
          rootContainer,
          rootDomViewer,
          ignore,
        })
      )
    }
  }
  private renderHtmlTag(data: IHtmlTagData) {
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
    if (data.hasTail) {
      tail = `${
        data.hasTail ? '…' : ''
      }<span class="html-tag">&lt;<span class="tag-name">/${
        data.tagName
      }</span>&gt;</span>`
    } else if (!this.isExpandable()) {
      tail = `<span class="html-tag">&lt;<span class="tag-name">/${data.tagName}</span>&gt;</span>`
    }

    let toggle = ''
    if (data.hasToggleButton) {
      toggle =
        '<div class="toggle "><span class="icon icon-arrow-right"></span><span class="icon icon-arrow-down"></span></div>'
    }

    return this.c(stripIndent`
      ${toggle}
      <span class="html-tag">&lt;<span class="tag-name">${data.tagName}</span>${attributes}&gt;</span>${tail}
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
  text?: string
  hasTail?: boolean
  hasToggleButton?: boolean
}

function getHtmlTagData(el: HTMLElement) {
  const ret: IHtmlTagData = {
    tagName: '',
    attributes: [],
  }

  ret.tagName = el.tagName.toLocaleLowerCase()
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

if (typeof module !== undefined) {
  exportCjs(module, DomViewer)
}
