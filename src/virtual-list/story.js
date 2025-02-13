import 'luna-virtual-list.css'
import VirtualList from 'luna-virtual-list'
import story from '../share/story'
import h from 'licia/h'
import toStr from 'licia/toStr'
import $ from 'licia/$'
import each from 'licia/each'
import random from 'licia/random'
import randomColor from 'licia/randomColor'
import readme from './README.md'
import randomId from 'licia/randomId'
import { button } from '@storybook/addon-knobs'

const def = story(
  'virtual-list',
  (wrapper) => {
    $(wrapper)
      .css({
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
      })
      .html('')
    const container = h('div')
    wrapper.appendChild(container)

    const virtualList = new VirtualList(container)

    function randomItems(count) {
      const items = []

      for (let i = 0; i < count; i++) {
        items.push(
          h(
            'div',
            {
              style: {
                color: '#fff',
                width: '100%',
                background: randomColor({ lightness: 0.5 }),
                minHeight: random(30, 100) + 'px',
                lineHeight: '1.5em',
              },
            },
            toStr(i) + ' ' + randomId(random(30, 1000))
          )
        )
      }

      return items
    }

    each(randomItems(100), (item) => virtualList.append(item))

    button('Append 10000 items', () => {
      each(randomItems(10000), (item) => virtualList.append(item))
      return false
    })

    button('Set 10000 items', () => {
      virtualList.setItems(randomItems(10000))
      return false
    })

    button('Clear', () => {
      virtualList.clear()
      return false
    })

    return virtualList
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { virtualList } = def
