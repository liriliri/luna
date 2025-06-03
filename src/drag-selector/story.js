import 'luna-drag-selector.css'
import LunaDragSelector from 'luna-drag-selector.js'
import story from '../share/story'
import readme from './README.md'
import $ from 'licia/$'
import { colorBorder, colorBorderDark } from '../share/theme'

const def = story(
  'drag-selector',
  (container, theme) => {
    $(container).css({
      width: '100%',
      maxWidth: 640,
      height: 360,
      margin: '0 auto',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      userSelect: 'none',
      border: `1px solid ${theme === 'light' ? colorBorder : colorBorderDark}`,
    })
    const itemStyle =
      'width:100px;height:100px;line-height:50px;text-align:center;margin:15px;background:red;color:white;'
    for (let i = 0; i < 100; i++) {
      const num = i + 1
      $(container).append(
        `<div style="${itemStyle}" data-num="${num}">Item ${num}</div>`
      )
    }
    const $items = $(container).find('div')

    const dragSelector = new LunaDragSelector(container)
    dragSelector.on('select', function () {
      $items.each(function (i, item) {
        if (dragSelector.isSelected(item)) {
          $(item).css('background', 'blue')
        } else {
          $(item).css('background', 'red')
        }
      })
    })
    dragSelector.on('change', function () {
      const selectedItems = []
      $items.each(function (i, item) {
        if (dragSelector.isSelected(item)) {
          selectedItems.push($(item).data('num'))
        }
      })
      if (selectedItems.length > 0) {
        console.log('Selected items:', selectedItems.join(', '))
      }
    })

    return dragSelector
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { dragSelector } = def
