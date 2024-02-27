import map from 'licia/map'
import trim from 'licia/trim'
import root from 'licia/root'
import html from 'licia/html'
import isNum from 'licia/isNum'
import contain from 'licia/contain'
import toNum from 'licia/toNum'
import detectOs from 'licia/detectOs'
import loadImg from 'licia/loadImg'
import isHidden from 'licia/isHidden'

export function exportCjs(module: any, clazz: any) {
  try {
    module.exports = clazz
    module.exports.default = clazz
  } catch (e) {
    /* eslint-disable no-empty */
  }
}

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

export const hasTouchSupport = 'ontouchstart' in root
export const hasPointerSupport = 'PointerEvent' in root
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
const pointerEvents: any = {
  start: 'pointerdown',
  move: 'pointermove',
  end: 'pointerup',
}

export function drag(name: string) {
  if (hasPointerSupport) {
    return pointerEvents[name]
  }

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

export function eventPage(type: string, e: any) {
  const name = type === 'x' ? 'pageX' : 'pageY'

  if (e[name]) {
    return e[name]
  }
  if (e.changedTouches) {
    return e.changedTouches[0][name]
  }

  return 0
}

let scrollbarWidth: number

export function measuredScrollbarWidth() {
  if (isNum(scrollbarWidth)) {
    return scrollbarWidth
  }
  if (!document) {
    return 16
  }

  const scrollDiv = document.createElement('div')
  const innerDiv = document.createElement('div')
  scrollDiv.setAttribute(
    'style',
    'display: block; width: 100px; height: 100px; overflow: scroll;'
  )
  innerDiv.setAttribute('style', 'height: 200px')
  scrollDiv.appendChild(innerDiv)
  const container = document.body || document.documentElement
  container.appendChild(scrollDiv)
  scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  container.removeChild(scrollDiv)
  return scrollbarWidth
}

export function hasVerticalScrollbar(el: HTMLElement) {
  return el.scrollHeight > el.offsetHeight
}

export function executeAfterTransition(el: HTMLElement, callback: () => any) {
  if (isHidden(el)) {
    return callback()
  }
  const handler = (e: any) => {
    const target = e.target
    if (target !== el) {
      return
    }
    el.removeEventListener('transitionend', handler)
    callback()
  }
  el.addEventListener('transitionend', handler)
}

export function pxToNum(str: string) {
  return toNum(str.replace('px', ''))
}

export function getPlatform() {
  const os = detectOs()
  if (os === 'os x') {
    return 'mac'
  }
  return os
}

export function resetCanvasSize(canvas: HTMLCanvasElement) {
  canvas.width = Math.round(canvas.offsetWidth * window.devicePixelRatio)
  canvas.height = Math.round(canvas.offsetHeight * window.devicePixelRatio)
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    loadImg(url, function (err, img) {
      if (err) {
        return reject(err)
      }

      resolve(img)
    })
  })
}
