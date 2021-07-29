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

    this.renderChildren(null, this.$container)
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
      if (els.length === 0 && el.erudaDom) {
        el.erudaDom.select()
      }
    }
  }
  private renderHtmlTag(data: IHtmlTagData) {
    const attributes = map(data.attributes, (attribute) => {
      const { name, value, underline } = attribute

      return `<span class="attribute">
          <span class="attribute-name">${name}</span>${
        value
          ? `="<span class="attribute-value${
              underline ? ' attribute-underline' : ''
            }">${value}</span>"`
          : ''
      }</span>`
    })

    let tail = ''
    if (data.hasTail) {
      tail = `
        ${data.text || '...'}
        <span class="html-tag">&lt;<span class="tag-name">/${
          data.tagName
        }</span>&gt;</span>`
    }

    return this.c(stripIndent`
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
  private renderChildren(node: ChildNode | null, $container: $.$) {
    let children
    if (!node) {
      children = [document.documentElement]
    } else {
      children = toArr(node.childNodes)
    }

    const container = $container.get(0)

    if (node) {
      children.push({
        nodeType: 'END_TAG',
        node,
      })
    }
    each(children, (child) => this.renderChild(child, container as HTMLElement))
  }
  private renderChild(child: ChildNode, container: HTMLElement) {
    const { c } = this
    const $tag = $(h('li'))
    let isEndTag = false

    $tag.addClass(c('tree-item'))
    if (child.nodeType === child.ELEMENT_NODE) {
      const childCount = child.childNodes.length
      const expandable = childCount > 0
      const data = {
        ...getHtmlTagData(child as HTMLElement),
        hasTail: expandable,
      }
      const hasOneTextNode =
        childCount === 1 && child.childNodes[0].nodeType === child.TEXT_NODE
      if (hasOneTextNode) {
        data.text = child.childNodes[0].nodeValue
      }
      $tag.html(this.renderHtmlTag(data))
      if (expandable && !hasOneTextNode) {
        $tag.addClass('expandable')
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const value = child.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderTextNode(value))
    } else if (child.nodeType === Node.COMMENT_NODE) {
      const value = child.nodeValue as string
      if (value.trim() === '') return

      $tag.html(this.renderHtmlComment(value))
    } else if (child.nodeType === 'END_TAG') {
      isEndTag = true
      child = child.node
      $tag.html(
        c(`<span class="html-tag" style="margin-left: -12px;">&lt;<span class="tag-name">/${child.tagName.toLocaleLowerCase()}</span>&gt;</span><span class="selection"></span>`)
      )
    } else {
      return
    }
    const $children = $(h('ul'))
    $children.addClass(c('children'))

    container.appendChild($tag.get(0))
    container.appendChild($children.get(0))

    if (child.nodeType !== child.ELEMENT_NODE) return

    let erudaDom = {}

    if ($tag.hasClass('expandable')) {
      const open = () => {
        $tag.html(
          this.renderHtmlTag({
            ...getHtmlTagData(child),
            hasTail: false,
          })
        )
        $tag.addClass('expanded')
        this.renderChildren(child, $children)
      }
      const close = () => {
        $children.html('')
        $tag.html(
          this.renderHtmlTag({
            ...getHtmlTagData(child),
            hasTail: true,
          })
        )
        $tag.rmClass('expanded')
      }
      const toggle = () => {
        if ($tag.hasClass('expanded')) {
          close()
        } else {
          open()
        }
      }
      $tag.on('click', '.toggle-btn', (e) => {
        e.stopPropagation()
        toggle()
      })
      erudaDom = {
        open,
        close,
      }
    }

    const select = () => {
      this.$container.find('.selected').rmClass('selected')
      $tag.addClass('selected')
    }
    $tag.on('click', select)
    erudaDom.select = select
    if (!isEndTag) child.erudaDom = erudaDom
  }
}

interface IAttribute {
  name: string
  value: string
  underline?: boolean
}

interface IBasicHtmlTagData {
  tagName: string
  attributes: IAttribute[]
}

interface IHtmlTagData extends IBasicHtmlTagData {
  text?: string
  hasTail?: string
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
      underline: isUrlAttribute(el, name),
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
