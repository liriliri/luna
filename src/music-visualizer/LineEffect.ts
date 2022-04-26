import MusicVisualizer, { IEffect } from './index'
import random from 'licia/random'
import isEmpty from 'licia/isEmpty'

export default class LineEffect implements IEffect {
  private musicVisualizer: MusicVisualizer
  private average = 0
  private lastValue: number[] = []
  private color: any = {}
  private separate: number[] = []
  private separateTimer = 0
  private shadowBlur = 0
  private image = new Image()
  constructor(musicVisualizer: MusicVisualizer) {
    this.musicVisualizer = musicVisualizer

    this.color = {
      r: 100,
      g: 100,
      b: 100,
      rS: random(1, 3),
      gS: random(1, 3),
      bS: random(1, 3),
      rD: 1,
      gD: 1,
      bD: 1,
    }
  }
  draw() {
    const { musicVisualizer, separate, lastValue, image } = this
    let { separateTimer, shadowBlur } = this
    const { ctx, canvas } = musicVisualizer
    const data = musicVisualizer.getData()
    const len = data.length / 2

    if (isEmpty(lastValue) || lastValue.length !== len) {
      console.log('init', len)
      this.init()
    }

    const width = canvas.width / len
    let x = 0
    let y = 0
    let direction = 1
    const middle = canvas.height / 2
    let seperateLength = 0
    let seperateNum = 0
    let total = 0
    const lastAvarage = this.average
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (image.src) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    this.changeColor()
    const { r, g, b } = this.color
    ctx.shadowColor =
      'rgba(' + (r + 70) + ', ' + (g + 70) + ', ' + (b + 70) + ', 1)'
    ctx.shadowBlur = shadowBlur
    ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)'
    ctx.lineWidth = 3
    ctx.lineJoin = 'miter'
    ctx.miterLimit = 100
    ctx.beginPath()
    ctx.moveTo(0, middle)
    if (separateTimer == 0) {
      separateTimer = Math.floor(Math.random() * 50) + 20
      for (let i = 0; i < len; i++) {
        separate[i] = 0
      }
      seperateNum = Math.floor(Math.random() * 15)
      for (let i = 0; i < seperateNum; i++) {
        seperateLength = Math.floor(Math.random() * 15)
        const temp = Math.floor(Math.random() * len)
        separate[temp] = 1
        for (let j = 1; j < seperateLength; j++) {
          separate[temp + j] = 1
        }
      }
    } else {
      separateTimer--
    }
    this.separateTimer = separateTimer
    for (let i = 0, len = lastValue.length; i < len; i++) {
      y = data[i] - (100 - i) * 0.5
      y = y - 100 < 0 ? 0 : y - 100
      if (y > middle) {
        y = middle
      }
      if (separate[i] == 1) {
        lastValue[i] -= 20
        if (lastValue[i] < 0) {
          lastValue[i] = 0
        }
        y = lastValue[i]
      } else {
        if (y - lastValue[i] > 20) {
          lastValue[i] += 20
          y = lastValue[i]
        } else {
          lastValue[i] = y
        }
      }
      y = y * direction + middle
      ctx.lineTo(x, y)
      total += y
      direction = -direction
      x = x + width
    }
    const average = total / len
    if (lastAvarage > average) {
      shadowBlur--
    } else {
      shadowBlur++
    }
    this.shadowBlur = shadowBlur
    ctx.lineTo(canvas.width, middle)
    ctx.stroke()
    ctx.restore()
  }
  private changeColor() {
    const { color } = this
    const choice = random(0, 9)
    if (choice < 3) {
      color.r = color.r + color.rS * color.rD
      if (color.r > 225) {
        color.rD = -1
      } else if (color.r < 100) {
        color.rD = 1
      }
    } else if (choice < 6) {
      color.g = color.g + color.gS * color.gD
      if (color.g > 225) {
        color.gD = -1
      } else if (color.g < 100) {
        color.gD = 1
      }
    } else {
      color.b = color.b + color.bS * color.bD
      if (color.b > 225) {
        color.bD = -1
      } else if (color.b < 100) {
        color.bD = 1
      }
    }
  }
  private init() {
    const { lastValue, musicVisualizer } = this
    const len = musicVisualizer.getData().length / 2
    for (let i = 0; i < len; i++) {
      lastValue[i] = 0
    }
    lastValue.length = len

    const image = musicVisualizer.getOption('image')
    if (image) {
      this.image.src = image
    }
  }
}
