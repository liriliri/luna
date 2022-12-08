import 'luna-tab.css'
import Tab from 'luna-tab.js'
import readme from './README.md'
import story from '../share/story'
import { number } from '@storybook/addon-knobs'

const def = story(
  'tab',
  (container) => {
    const height = number('Height', 30, {
      range: true,
      min: 30,
      max: 80,
    })

    const tab = new Tab(container, {
      height,
    })
    tab.append({
      id: 'console',
      title: 'Console',
    })
    tab.append({
      id: 'elements',
      title: 'Elements',
    })
    tab.append({
      id: 'resources',
      title: 'Resources',
    })
    tab.insert(2, {
      id: 'network',
      title: 'Network',
    })
    tab.append({
      id: 'sources',
      title: 'Sources',
    })
    tab.append({
      id: 'info',
      title: 'Info',
    })
    tab.append({
      id: 'snippets',
      title: 'Snippets',
    })
    tab.append({
      id: 'settings',
      title: 'Settings',
    })
    tab.select('console')

    return tab
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { tab } = def
