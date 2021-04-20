import Component from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import extend from 'licia/extend'
import ResizeSensor from 'licia/ResizeSensor'
import throttle from 'licia/throttle'
import clone from 'licia/clone'
import max from 'licia/max'
import contain from 'licia/contain'
import { drag, eventClient } from '../share/util'

const $document = $(document as any)

interface IOptions {
  url: string
  preview: HTMLElement | null
}

interface IImageData {
  image: HTMLImageElement
  width: number
  height: number
  ratio: number
}

interface ICanvasData {
  left: number
  top: number
  width: number
  height: number
}

interface IContainerData {
  width: number
  height: number
}

interface ICropBoxData {
  left: number
  top: number
  width: number
  height: number
}

export default class Cropper extends Component {
  private onResize: () => void
  private resizeSensor: ResizeSensor
  private containerData: IContainerData = {
    width: 0,
    height: 0,
  }
  private imageData: IImageData = {
    image: new Image(),
    width: 0,
    height: 0,
    ratio: 0,
  }
  private canvasData: ICanvasData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  }
  private cropBoxData: ICropBoxData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  }
  private oldCropBoxData: ICropBoxData
  private $canvas: $.$
  private $cropBox: $.$
  private action = ''
  private startX = 0
  private startY = 0
  private $preview: $.$ | null = null
  constructor(container: HTMLElement, { url, preview }: IOptions) {
    super(container, { compName: 'cropper' })

    this.oldCropBoxData = this.cropBoxData

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => this.reset(), 16)

    this.updateContainerData()
    this.initTpl()
    this.$canvas = this.find('.canvas')
    this.$cropBox = this.find('.crop-box')

    this.bindEvent()

    if (preview) {
      this.initPreview(preview)
    }

    this.load(url)
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  reset() {
    this.updateContainerData()
    this.resetCanvasData()
    this.updateCanvas()
    this.resetCropBoxData()
    this.updateCropBox()
  }
  private initPreview(el: HTMLElement) {
    this.$preview = $(el)
    this.$preview.addClass(this.c('preview'))
    this.$preview.html('<img></img>')
  }
  private load(url: string) {
    const { image } = this.imageData
    this.$canvas.find('img').attr('src', url)
    this.$cropBox.find('img').attr('src', url)
    if (this.$preview) {
      this.$preview.find('img').attr('src', url)
    }

    image.onload = () => {
      extend(this.imageData, {
        width: image.width,
        height: image.height,
        ratio: image.width / image.height,
      })
      this.reset()
    }
    image.src = url
  }

  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)
    this.$container.on(drag('start'), this.onCropStart)
  }
  private onCropStart = (e: any) => {
    e = e.origEvent
    this.action = $(e.target).data('action')
    this.$container.addClass(this.c(`cursor-${this.action}`))
    this.startX = eventClient('x', e)
    this.startY = eventClient('y', e)
    this.oldCropBoxData = clone(this.cropBoxData)
    $document.on(drag('move'), this.onCropMove)
    $document.on(drag('end'), this.onCropEnd)
  }
  private onCropMove = (e: any) => {
    e = e.origEvent
    const { action, canvasData, oldCropBoxData } = this
    let { left, top, width, height } = oldCropBoxData
    const minLeft = canvasData.left
    const minTop = canvasData.top
    const maxLeft = canvasData.left + canvasData.width
    const maxTop = canvasData.top + canvasData.height
    const minSize = 10

    if (action === 'crop') {
      const containerOffset = this.$container.offset()
      left = this.startX - containerOffset.left
      top = this.startY - containerOffset.top
      width = minSize
      height = minSize
      if (
        left < minLeft ||
        top < minTop ||
        left + width > maxLeft ||
        top + height > maxTop
      ) {
        return
      }
    }

    let newLeft = left
    let newTop = top
    let newWidth = width
    let newHeight = height
    const deltaX = eventClient('x', e) - this.startX
    const deltaY = eventClient('y', e) - this.startY

    switch (action) {
      case 'all':
        newLeft += deltaX
        newTop += deltaY
        newLeft = max(minLeft, newLeft)
        newTop = max(minTop, newTop)
        if (newLeft + width > maxLeft) {
          newLeft = maxLeft - width
        }
        if (newTop + height > maxTop) {
          newTop = maxTop - height
        }
        break
      case 'crop':
        newWidth += deltaX - minSize
        newWidth = max(minSize, newWidth)
        if (left + newWidth > maxLeft) {
          newWidth = maxLeft - left
        }
        newHeight += deltaY - minSize
        newHeight = max(minSize, newHeight)
        if (top + newHeight > maxTop) {
          newHeight = maxTop - top
        }
        break
      case 'e':
        newWidth += deltaX
        newWidth = max(minSize, newWidth)
        if (left + newWidth > maxLeft) {
          newWidth = maxLeft - left
        }
        break
      case 's':
        newHeight += deltaY
        newHeight = max(minSize, newHeight)
        if (top + newHeight > maxTop) {
          newHeight = maxTop - top
        }
        break
      case 'w':
        if (left + deltaX < minLeft) {
          newWidth -= minLeft - left
          newLeft = minLeft
        } else if (width - deltaX < minSize) {
          newLeft = left + width - minSize
          newWidth = minSize
        } else {
          newLeft += deltaX
          newWidth -= deltaX
        }
        break
      case 'n':
        if (top + deltaY < minTop) {
          newHeight -= minTop - top
          newTop = minTop
        } else if (height - deltaY < minSize) {
          newTop = top + height - minSize
          newHeight = minSize
        } else {
          newTop += deltaY
          newHeight -= deltaY
        }
        break
    }

    if (contain(['nw', 'ne', 'sw', 'se'], action)) {
      const useDeltaX = this.isDeltaXUsed(deltaX, deltaY, action)
      const ratio = width / height

      switch (action) {
        case 'nw':
          if (useDeltaX) {
            newWidth = width - deltaX
            newHeight = newWidth / ratio
          } else {
            newHeight = height - deltaY
            newWidth = newHeight * ratio
          }
          newLeft = left + width - newWidth
          newTop = top + height - newHeight
          if (newLeft < minLeft) {
            newLeft = minLeft
            newWidth = left - minLeft + width
            newHeight = newWidth / ratio
            newTop = top + height - newHeight
          }
          if (newTop < minTop) {
            newTop = minTop
            newHeight = top - minTop + height
            newWidth = newHeight * ratio
            newLeft = left + width - newWidth
          }
          if (newWidth < minSize) {
            newWidth = minSize
            newHeight = newWidth / ratio
            newLeft = left + width - newWidth
            newTop = top + height - newHeight
          }
          if (newHeight < minSize) {
            newHeight = minSize
            newWidth = newHeight * ratio
            newLeft = left + width - newWidth
            newTop = top + height - newHeight
          }
          break
        case 'ne':
          newLeft = left
          if (useDeltaX) {
            newWidth = width + deltaX
            newHeight = newWidth / ratio
          } else {
            newHeight = height - deltaY
            newWidth = newHeight * ratio
          }
          newTop = top + height - newHeight
          if (newTop < minTop) {
            newTop = minTop
            newHeight = top - minTop + height
            newWidth = newHeight * ratio
          }
          if (newWidth < minSize) {
            newWidth = minSize
            newHeight = newWidth / ratio
            newTop = top + height - newHeight
          }
          if (newHeight < minSize) {
            newHeight = minSize
            newWidth = newHeight * ratio
            newTop = top + height - newHeight
          }
          if (newLeft + newWidth > maxLeft) {
            newWidth = maxLeft - newLeft
            newHeight = newWidth / ratio
            newTop = top + height - newHeight
          }
          break
        case 'sw':
          newTop = top
          if (useDeltaX) {
            newWidth = width - deltaX
            newHeight = newWidth / ratio
          } else {
            newHeight = height + deltaY
            newWidth = newHeight * ratio
          }
          newLeft = left + width - newWidth
          if (newLeft < minLeft) {
            newLeft = minLeft
            newWidth = left - minLeft + width
            newHeight = newWidth / ratio
          }
          if (newWidth < minSize) {
            newWidth = minSize
            newHeight = newWidth / ratio
            newLeft = left + width - newWidth
          }
          if (newHeight < minSize) {
            newHeight = minSize
            newWidth = newHeight * ratio
            newLeft = left + width - newWidth
          }
          if (newTop + newHeight > maxTop) {
            newHeight = maxTop - newTop
            newWidth = newHeight * ratio
            newLeft = left + width - newWidth
          }
          break
        case 'se':
          newLeft = left
          newTop = top
          if (useDeltaX) {
            newWidth = width + deltaX
            newHeight = newWidth / ratio
          } else {
            newHeight = height + deltaY
            newWidth = newHeight * ratio
          }
          if (newWidth < minSize) {
            newWidth = minSize
            newHeight = newWidth / ratio
          }
          if (newHeight < minSize) {
            newHeight = minSize
            newWidth = newHeight * ratio
          }
          if (newLeft + newWidth > maxLeft) {
            newWidth = maxLeft - newLeft
            newHeight = newWidth / ratio
          }
          if (newTop + newHeight > maxTop) {
            newHeight = maxTop - newTop
            newWidth = newHeight * ratio
          }
          break
      }
    }

    extend(this.cropBoxData, {
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight,
    })

    this.updateCropBox()
  }
  private isDeltaXUsed(deltaX: number, deltaY: number, action: string) {
    const { width, height } = this.oldCropBoxData
    const ratio = width / height

    const absDeltaX = abs(deltaX)
    const absDeltaY = abs(deltaY)
    const absDeltaYX = absDeltaY * ratio
    const absDeltaXY = absDeltaX / ratio

    switch (action) {
      case 'nw':
        if (deltaX < 0) {
          if (deltaY > 0) {
            return true
          } else {
            return absDeltaX > absDeltaYX
          }
        } else {
          if (deltaY > 0) {
            return absDeltaY > absDeltaXY
          } else {
            return false
          }
        }
      case 'ne':
        if (deltaX < 0) {
          if (deltaY > 0) {
            return absDeltaY > absDeltaXY
          } else {
            return false
          }
        } else {
          if (deltaY > 0) {
            return true
          } else {
            return absDeltaX > absDeltaYX
          }
        }
      case 'sw':
        if (deltaX < 0) {
          if (deltaY > 0) {
            return absDeltaX > absDeltaYX
          } else {
            return true
          }
        } else {
          if (deltaY > 0) {
            return false
          } else {
            return absDeltaY > absDeltaXY
          }
        }
      case 'se':
        if (deltaX < 0) {
          if (deltaY > 0) {
            return false
          } else {
            return absDeltaY > absDeltaXY
          }
        } else {
          if (deltaY > 0) {
            return absDeltaX > absDeltaYX
          } else {
            return true
          }
        }
    }
  }
  private onCropEnd = (e: any) => {
    this.onCropMove(e)
    this.$container.rmClass(this.c(`cursor-${this.action}`))
    $document.off(drag('move'), this.onCropMove)
    $document.off(drag('end'), this.onCropEnd)
    this.action = ''
  }
  private resetCropBoxData() {
    const { canvasData } = this

    const left = canvasData.width / 8 + canvasData.left
    const top = canvasData.height / 8 + canvasData.top

    extend(this.cropBoxData, {
      left,
      top,
      width: canvasData.width - canvasData.width / 4,
      height: canvasData.height - canvasData.height / 4,
    })
  }
  private updateCropBox() {
    const { cropBoxData, canvasData } = this
    const { left, top, width, height } = cropBoxData
    this.$cropBox.css({
      width: round(width),
      height: round(height),
      transform: `translateX(${round(left)}px) translateY(${round(top)}px)`,
    })
    this.$cropBox.find('img').css({
      width: round(canvasData.width),
      height: round(canvasData.height),
      transform: `translateX(${-round(
        left - canvasData.left
      )}px) translateY(${-round(top - canvasData.top)}px)`,
    })
    this.updatePreview()
  }
  private updatePreview() {
    const { $preview } = this
    if (!$preview) {
      return
    }
    const { cropBoxData, canvasData } = this
    const { width } = $preview.offset()
    const ratio = width / cropBoxData.width
    $preview.css({
      height: round(cropBoxData.height * ratio),
    })
    $preview.find('img').css({
      width: round(canvasData.width * ratio),
      height: round(canvasData.height * ratio),
      transform: `translateX(${-round(
        (cropBoxData.left - canvasData.left) * ratio
      )}px) translateY(${-round(
        (cropBoxData.top - canvasData.top) * ratio
      )}px)`,
    })
  }
  private resetCanvasData() {
    const { imageData, containerData } = this

    let width = imageData.width
    let height = imageData.height

    if (width > containerData.width) {
      width = containerData.width
      height = width / imageData.ratio
    }
    if (height > containerData.height) {
      height = containerData.height
      width = height * imageData.ratio
    }

    extend(this.canvasData, {
      left: (containerData.width - width) / 2,
      top: (containerData.height - height) / 2,
      width,
      height,
    })
  }
  private updateCanvas() {
    const { left, top, width, height } = this.canvasData
    this.$canvas.css({
      width: round(width),
      height: round(height),
      transform: `translateX(${round(left)}px) translateY(${round(top)}px)`,
    })
  }
  private updateContainerData() {
    const { width, height } = this.$container.offset()
    extend(this.containerData, {
      width,
      height,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="wrap-box">
          <div class="canvas">
            <img></img>
          </div>
        </div>
        <div class="drag-box" data-action="crop"></div>
        <div class="crop-box" style="width: 554.8px; height: 312.075px; transform: translateX(29.1px) translateY(56.775px);">
          <span class="view-box">
            <img draggable="false"></img>
          </span>
          <span class="dashed dashed-h"></span>
          <span class="dashed dashed-v"></span>
          <span class="center"></span>
          <span class="face" data-action="all"></span>
          <span class="line line-e" data-action="e"></span>
          <span class="line line-n" data-action="n"></span>
          <span class="line line-w" data-action="w"></span>
          <span class="line line-s" data-action="s"></span>
          <span class="point point-e" data-action="e"></span>
          <span class="point point-n" data-action="n"></span>
          <span class="point point-w" data-action="w"></span>
          <span class="point point-s" data-action="s"></span>
          <span class="point point-ne" data-action="ne"></span>
          <span class="point point-nw" data-action="nw"></span>
          <span class="point point-sw" data-action="sw"></span>
          <span class="point point-se" data-action="se"></span>
        </div>
      `)
    )
  }
}

module.exports = Cropper
module.exports.default = Cropper

const round = Math.round
const abs = Math.abs
