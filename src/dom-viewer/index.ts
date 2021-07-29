import Component from '../share/Component'
import each from 'licia/each'
import $ from 'licia/$'
import h from 'licia/h'
import map from 'licia/map'
import stripIndent from 'licia/stripIndent'
import toArr from 'licia/toArr'

export default class DomViewer extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'dom-viewer' })

    new DomViewerChild(this, this.container, document.documentElement)
    this.select(document.body)
  }
  select(el: HTMLElement) {
    const els: HTMLElement[] = []
    els.push(el)
    while (el.parentElement) {
      els.unshift(el.parentElement)
      el = el.parentElement
    }
    while (els.length > 0) {
      el = els.shift() as HTMLElement
      const erudaDom = (el as any).erudaDom
      if (erudaDom) {
        if (erudaDom.close && erudaDom.open) {
          erudaDom.close()
          erudaDom.open()
        }
      } else {
        break
      }
      if (els.length === 0 && (el as any).erudaDom) {
        ;(el as any).erudaDom.select()
      }
    }
  }
}

class DomViewerChild {
  node: ChildNode
  private container: HTMLElement
  private domViewer: DomViewer
  constructor(domViewer: DomViewer, container: HTMLElement, node: ChildNode) {
    this.domViewer = domViewer
    this.node = node
    this.container = container

    this.render()
  }
  private render() {
    const { container, domViewer } = this
    let { node } = this
    const { c } = this.domViewer
    const $tag = $(h('li'))
    let isEndTag = false

    $tag.addClass(c('tree-item'))
    if (node.nodeType === node.ELEMENT_NODE) {
      const childCount = node.childNodes.length
      const expandable = childCount > 0
      const data = {
        ...getHtmlTagData(node as HTMLElement),
        hasTail: expandable,
      }
      const hasOneTextNode =
        childCount === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE
      if (hasOneTextNode) {
        data.text = node.childNodes[0].nodeValue as string
      }
      $tag.html(this.renderHtmlTag(data))
      if (expandable && !hasOneTextNode) {
        $tag.addClass(c('expandable'))
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderTextNode(value))
    } else if (node.nodeType === Node.COMMENT_NODE) {
      const value = node.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderHtmlComment(value))
    } else if ((node.nodeType as any) === 'END_TAG') {
      isEndTag = true
      node = (node as any).node
      $tag.html(
        c(
          `<span class="html-tag" style="margin-left: -12px;">&lt;<span class="tag-name">/${(node as HTMLElement).tagName.toLocaleLowerCase()}</span>&gt;</span><span class="selection"></span>`
        )
      )
    } else {
      return
    }
    const $children = $(h('ul'))
    $children.addClass(c('children'))

    container.appendChild($tag.get(0))
    container.appendChild($children.get(0))

    if (node.nodeType !== node.ELEMENT_NODE) return

    let erudaDom: any = {}

    if ($tag.hasClass(c('expandable'))) {
      const open = () => {
        $tag.html(
          this.renderHtmlTag({
            ...getHtmlTagData(node as HTMLElement),
            hasTail: false,
          })
        )
        $tag.addClass(c('expanded'))
        this.renderChildren(node, $children)
      }
      const close = () => {
        $children.html('')
        $tag.html(
          this.renderHtmlTag({
            ...getHtmlTagData(node as HTMLElement),
            hasTail: true,
          })
        )
        $tag.rmClass(c('expanded'))
      }
      const toggle = () => {
        if ($tag.hasClass(c('expanded'))) {
          close()
        } else {
          open()
        }
      }
      $tag.on('click', c('.toggle-btn'), (e) => {
        e.stopPropagation()
        toggle()
      })
      erudaDom = {
        open,
        close,
      }
    }

    const select = () => {
      domViewer.$container.find(c('.selected')).rmClass(c('selected'))
      $tag.addClass(c('selected'))
    }
    $tag.on('click', select)
    erudaDom.select = select
    if (!isEndTag) {
      ;(node as any).erudaDom = erudaDom
    }
  }
  private renderChildren(node: ChildNode, $container: $.$) {
    const children = toArr(node.childNodes)

    const container = $container.get(0)

    if (node) {
      children.push({
        nodeType: 'END_TAG',
        node,
      })
    }
    each(children, (child) => {
      new DomViewerChild(this.domViewer, container as HTMLElement, child)
    })
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

    return this.domViewer.c(stripIndent`
      <span class="toggle-btn"></span>
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
