import 'luna-box-model.css'
import $ from 'licia/$'
import h from 'licia/h'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import BoxModel from 'luna-box-model.js'
import { text, object } from '@storybook/addon-knobs'

const def = story(
  'box-model',
  (wrapper) => {
    $(wrapper).html('')

    const container = h('div')
    wrapper.appendChild(container)

    const boxModel = new BoxModel(container)

    const position = object('Position', {
      left: 50,
      top: 200,
    })
    const margin = text('Margin', '40px 30px 20px 10px')
    const border = text('Border', '25px solid #614d82')
    const padding = text('Padding', '10px 20px 30px 40px')
    const size = object('Size', {
      width: 200,
      height: 150,
    })

    const target = h(
      'div',
      {
        style: {
          padding,
          margin,
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: size.width,
          height: size.height,
          color: '#fff',
          lineHeight: 150,
          fontSize: 30,
          border,
          textAlign: 'center',
          background: '#e73c5e',
        },
      },
      'Target'
    )
    wrapper.appendChild(target)

    boxModel.setOption('element', target)

    boxModel
      .on('highlight', (type) => console.log('highlight', type))
      .on('leave', () => console.log('leave'))

    return boxModel
  },
  {
    readme,
    changelog,
    source: __STORY__,
  }
)

export default def

export const { boxModel } = def
