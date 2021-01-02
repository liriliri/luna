import map from 'licia/map'
import trim from 'licia/trim'
import root from 'licia/root'
import html from 'licia/html'
import contain from 'licia/contain'

export function classPrefix(name: string) {
  const prefix = `luna-${name}-`

  function processClass(str: string) {
    return map(trim(str).split(/\s+/), (singleClass) => {
      if (contain(singleClass, prefix)) {
        return singleClass
      }

      return singleClass.replace(/[\w-]+/, (match) => `${prefix}${match}`)
    }).join(' ')
  }

  return function (str: string) {
    if (/<[^>]*>/g.test(str)) {
      try {
        const tree = html.parse(str)
        traverseTree(tree, (node: any) => {
          if (node.attrs && node.attrs.class) {
            node.attrs.class = processClass(node.attrs.class)
          }
        })
        return html.stringify(tree)
      } catch (e) {
        return processClass(str)
      }
    }

    return processClass(str)
  }
}

function traverseTree(tree: any[], handler: any) {
  for (let i = 0, len = tree.length; i < len; i++) {
    const node = tree[i]
    handler(node)
    if (node.content) {
      traverseTree(node.content, handler)
    }
  }
}

const hasTouchSupport = 'ontouchstart' in root
const touchEvents: any = {
  start: 'touchstart',
  move: 'touchmove',
  end: 'touchend',
}
const mouseEvents: any = {
  start: 'mousedown',
  move: 'mousemove',
  end: 'mouseup',
}

export function drag(name: string) {
  return hasTouchSupport ? touchEvents[name] : mouseEvents[name]
}

export function eventClient(type: string, e: any) {
  const name = type === 'x' ? 'clientX' : 'clientY'

  if (e[name]) {
    return e[name]
  }
  if (e.changedTouches) {
    return e.changedTouches[0][name]
  }

  return 0
}
