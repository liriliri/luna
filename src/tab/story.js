import 'luna-tab.css'
import Tab from 'luna-tab.js'
import readme from './README.md'
import story from '../share/story'
import { number } from '@storybook/addon-knobs'
import LunaTab, { LunaTabItem } from './react'

const def = story(
  'tab',
  (container) => {
    const { height } = createKnobs()

    const tab = new Tab(container, {
      height,
    })
    tab.on('select', (id) => {
      console.log('select', id)
    })
    tab.on('close', (id) => {
      console.log('close', id)
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
      closeable: true,
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
    ReactComponent() {
      const { height } = createKnobs()

      return (
        <LunaTab
          height={height}
          onSelect={(id) => console.log('select', id)}
          onClose={(id) => console.log('close', id)}
          onCreate={(tab) => console.log(tab)}
        >
          <LunaTabItem id="console" title="Console" selected={true} />
          <LunaTabItem id="elements" title="Elements" />
          <LunaTabItem id="network" title="Network" />
          <LunaTabItem id="resources" title="Resources" />
          <LunaTabItem id="sources" title="Sources" />
          <LunaTabItem id="info" title="Info" />
          <LunaTabItem id="snippets" title="Snippets" closable={true} />
          <LunaTabItem id="settings" title="Settings" />
        </LunaTab>
      )
    },
  }
)

function createKnobs() {
  const height = number('Height', 30, {
    range: true,
    min: 30,
    max: 80,
  })

  return {
    height,
  }
}

export default def

export const { tab: html, react } = def
