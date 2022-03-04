import Component, { IComponentOptions } from '../share/Component'
import each from 'licia/each'
import $ from 'licia/$'
import h from 'licia/h'
import map from 'licia/map'
import filter from 'licia/filter'
import stripIndent from 'licia/stripIndent'
import toArr from 'licia/toArr'

interface IOptions extends IComponentOptions {
  node?: ChildNode
  parent?: DomViewer | null
  isEndTag?: boolean
  rootContainer?: HTMLElement
}

class DomViewer extends Component<IOptions> {
  private $tag: $.$
  private $children: $.$
  private isExpanded = false
  private isExpandable = false
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'dom-viewer' }, options)

    this.initOptions(options, {
      node: document.documentElement,
      parent: null,
      isEndTag: false,
      rootContainer: container,
    })

    this.initTpl()
    this.bindEvent()
  }
  select = () => {
    const { c } = this
    $(this.options.rootContainer).find(c('.selected')).rmClass(c('selected'))
    this.$tag.addClass(c('selected'))
  }
  expand() {
    if (!this.isExpandable) {
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
    this.renderChildNodes(node as HTMLElement)
  }
  collapse() {
    if (!this.isExpandable) {
      return
    }
    this.isExpanded = false

    const { $tag, c } = this
    const { node } = this.options

    this.$children.html('')
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
  private bindEvent() {
    const { c, $tag } = this

    if (this.isExpandable) {
      $tag.on('click', c('.toggle'), (e: any) => {
        e.stopPropagation()
        this.toggle()
      })
    }

    $tag.on('click', this.select)
  }
  private getChildNodes(el: HTMLElement) {
    const { rootContainer } = this.options
    let childNodes = toArr(el.childNodes)
    childNodes = filter(childNodes, (child) => child !== rootContainer)
    return childNodes
  }
  private initTpl() {
    const { container, c } = this
    const { node, isEndTag } = this.options

    let isExpandable = false
    const $tag = $(h('li'))
    $tag.addClass(c('tree-item'))
    this.$tag = $tag

    if (isEndTag) {
      $tag.html(
        c(
          `<span class="html-tag" style="margin-left: -12px;">&lt;<span class="tag-name">/${(node as HTMLElement).tagName.toLocaleLowerCase()}</span>&gt;</span><span class="selection"></span>`
        )
      )
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childCount = this.getChildNodes(node as HTMLElement).length
      const data = {
        ...getHtmlTagData(node as HTMLElement),
        hasTail: childCount > 0,
      }
      const hasOneTextNode =
        childCount === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE
      if (hasOneTextNode) {
        data.text = node.childNodes[0].nodeValue as string
      }
      if (data.hasTail && !hasOneTextNode) {
        isExpandable = true
        data.hasToggleButton = true
      }
      $tag.html(this.renderHtmlTag(data))
    } else if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderTextNode(value))
    } else if (node.nodeType === Node.COMMENT_NODE) {
      const value = node.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderHtmlComment(value))
    } else {
      return
    }

    container.appendChild($tag.get(0))

    if (node.nodeType !== node.ELEMENT_NODE) {
      return
    }
    if (!isExpandable) {
      return
    }
    this.isExpandable = true

    const $children = $(h('ul'))
    $children.addClass(c('children'))
    container.appendChild($children.get(0))
    this.$children = $children
  }
  private renderChildNodes(node: HTMLElement) {
    const { rootContainer } = this.options
    const $container = this.$children
    let childNodes = this.getChildNodes(node)
    childNodes = filter(childNodes, (child) => child !== rootContainer)

    const container = $container.get(0)

    each(childNodes, (node) => {
      new DomViewer(container as HTMLElement, {
        node,
        parent: this,
        rootContainer,
      })
    })

    if (node) {
      new DomViewer(container as HTMLElement, {
        node,
        parent: this,
        isEndTag: true,
        rootContainer,
      })
    }
  }
  private renderHtmlTag(data: IHtmlTagData) {
    const attributes = map(data.attributes, (attribute) => {
      const { name, value, isLink } = attribute

      return `<span class="attribute">
          <span class="attribute-name">${name}</span>${
        value
          ? `="<span class="attribute-value${
              isLink ? ' attribute-underline' : ''
            }">${value}</span>"`
          : ''
      }</span>`
    })

    let tail = ''
    if (data.hasTail) {
      tail = `${
        data.text || '…'
      }<span class="html-tag">&lt;<span class="tag-name">/${
        data.tagName
      }</span>&gt;</span>`
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
  private renderTextNode(value: string) {
    return `"<span class="text-node">${value}</span>"`
  }
  private renderHtmlComment(value: string) {
    return `<span class="html-comment">&lt;!-- ${value} --&gt;</span>`
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

module.exports = DomViewer
module.exports.default = DomViewer
