import isEmpty from 'licia/isEmpty'
import MusicVisualizer, { IEffect } from './index'

interface IBar {
  x: number
  w: number
  h: number
}

export default class BarEffect implements IEffect {
  private musicVisualizer: MusicVisualizer
  private dots: number[] = []
  private bars: IBar[] = []
  private image = new Image()
  constructor(musicVisualizer: MusicVisualizer) {
    this.musicVisualizer = musicVisualizer

    musicVisualizer.on('resize', this.init)
  }
  draw() {
    const { musicVisualizer, bars, dots, image } = this
    const data = musicVisualizer.getData()
    const { ctx, canvas } = this.musicVisualizer
    const { width, height } = canvas
    const len = Math.floor(data.length / 2)

    if (isEmpty(bars) || bars.length !== len) {
      this.init()
    }

    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    if (image.src) {
      ctx.drawImage(image, 0, 0, width, height)
    }
    ctx.fillStyle = '#fff'
    ctx.shadowBlur = 10
    ctx.shadowColor = '#fff'
    for (let i = 0; i < len; i++) {
      const b = bars[i]
      if (b.h == 0) {
        b.h = data[i]
      } else {
        if (b.h < data[i]) {
          b.h += Math.floor((data[i] - b.h) / 2)
        } else {
          b.h -= Math.floor((b.h - data[i]) / 1.2)
        }
      }
      const h = Math.max(height * (b.h / 256 - 1 / 3), 0)
      ctx.fillRect(b.x, height - h, b.w, h + 10)
      if (dots[i] < h) {
        dots[i] = h
      } else {
        dots[i]--
      }
      ctx.fillStyle = ctx.fillStyle.replace('0.8)', '0.5)')
      ctx.fillRect(b.x, height - dots[i] - b.w, b.w, b.w)
    }
    ctx.restore()
  }
  private init = () => {
    const { musicVisualizer } = this
    const { canvas } = musicVisualizer
    const { bars, dots } = this

    const image = musicVisualizer.getOption('image')
    if (image) {
      this.image.src = image
    }
    const { width } = canvas
    const len = Math.floor(musicVisualizer.getData().length / 2)
    const space = width / len / 2
    const barWidth = space
    let x = space / 2
    for (let i = 0; i < len; i++) {
      dots[i] = 0
      bars[i] = {
        x,
        w: barWidth,
        h: 0,
      }
      x += barWidth + space
    }
    bars.length = len
    dots.length = len
  }
}
