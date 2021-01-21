import BaseChart from './BaseChart'
import sum from 'licia/sum'
import toStr from 'licia/toStr'
import { px } from './util'

export default class PieChart extends BaseChart {
  private legendTextWidth = 0
  private radius = px(100)
  draw() {
    const { chart } = this
    const { ctx, canvas } = chart
    const { labels, datasets } = chart.getOption('data')

    const { data, bgColor } = datasets[0]
    const total = sum(...data)
    const len = labels.length

    let end = -Math.PI / 2
    const x = canvas.width / 2
    const y = canvas.height / 2
    for (let i = 0; i < len; i++) {
      ctx.font = `${px(12)}px Arial`
      this.legendTextWidth += Math.ceil(ctx.measureText(labels[i]).width)
      ctx.beginPath()
      ctx.strokeStyle = bgColor[i]
      ctx.fillStyle = bgColor[i]
      ctx.moveTo(x, y)
      const start = end
      end += (data[i] / total) * 2 * Math.PI
      ctx.arc(x, y, this.radius, start, end)
      ctx.closePath()
      ctx.fill()

      const middle = (start + end) / 2
      this.drawVal(data[i], middle)
    }

    end = -Math.PI / 2
    for (let i = 0; i < len; i++) {
      ctx.beginPath()
      ctx.strokeStyle = chart.getOption('bgColor')
      ctx.lineWidth = px(2)
      ctx.moveTo(x, y)
      const lineEnd = this.angleToPos(end)
      end += (data[i] / total) * 2 * Math.PI
      ctx.lineTo(x + lineEnd.x, y + lineEnd.y)
      ctx.stroke()
      ctx.closePath()
    }

    this.drawLegend()
  }
  private drawLegend() {
    const { chart } = this
    const { ctx, canvas } = chart
    const { datasets, labels } = chart.getOption('data')
    const len = labels.length
    const { bgColor } = datasets[0]

    ctx.beginPath()
    ctx.font = `${px(12)}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const x =
      (canvas.width - (this.legendTextWidth + (5 * len - 2) * px(10))) / 2
    let textWidth = 0

    for (let i = 0; i < len; i++) {
      const label = labels[i]
      ctx.fillStyle = bgColor[i]
      ctx.fillRect(
        x + 5 * px(10) * i + textWidth,
        px(45) - px(6),
        2 * px(10),
        px(10)
      )
      ctx.fillStyle = `${px(12)}px Arial`
      ctx.fillText(label, x + (5 * i + 3) * px(10) + textWidth, px(45))
      textWidth += Math.ceil(ctx.measureText(label).width)
    }
  }
  private angleToPos(angle: number) {
    return {
      x: this.radius * Math.cos(angle),
      y: this.radius * Math.sin(angle),
    }
  }
  private drawVal(val: number, middle: number) {
    const { chart } = this
    const { ctx, canvas } = chart
    const x = canvas.width / 2
    const y = canvas.height / 2
    const lineStart = this.angleToPos(middle)
    const startX = x + lineStart.x
    const startY = y + lineStart.y
    ctx.textBaseline = 'middle'
    ctx.moveTo(startX, startY)

    let middleX = 0
    let middleY = 0
    let endX = 0
    let valX = 0
    if (middle <= 0) {
      ctx.textAlign = 'left'
      middleX = startX + px(10)
      middleY = startY - px(10)
      endX = middleX + px(20)
      valX = startX + px(35)
    } else if (middle > 0 && middle <= Math.PI / 2) {
      ctx.textAlign = 'left'
      middleX = startX + px(10)
      middleY = startY + px(10)
      endX = middleX + px(20)
      valX = startX + px(35)
    } else if (middle > Math.PI / 2 && middle < Math.PI) {
      ctx.textAlign = 'right'
      middleX = startX - px(10)
      middleY = startY + px(10)
      endX = middleX - px(20)
      valX = startX - px(35)
    } else {
      ctx.textAlign = 'right'
      middleX = startX - px(10)
      middleY = startY - px(10)
      endX = middleX - px(20)
      valX = startX - px(35)
    }
    ctx.lineTo(middleX, middleY)
    ctx.moveTo(middleX, middleY)
    ctx.lineTo(endX, middleY)
    ctx.stroke()
    ctx.fillText(toStr(val), valX, middleY)
  }
}
