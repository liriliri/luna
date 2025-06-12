import SplitPane from './index'
import toEl from 'licia/toEl'
import test from '../share/test'

test('split-pane', (container) => {
  it('basic', () => {
    const splitPane = new SplitPane(container, {
      direction: 'horizontal',
    })
    splitPane.append(toEl('<div style="background: red;"></div>'), {
      weight: 30,
    })
    splitPane.append(toEl('<div style="background: blue;"></div>'), {
      weight: 70,
    })
    splitPane.append(toEl('<div style="background: green;"></div>'), {
      weight: 30,
    })
  })
})
