import 'luna-path-bar.css'
import PathBar from 'luna-path-bar.js'
import readme from './README.md'
import story from '../share/story'
import LunaPathBar from './react'
import { text } from '@storybook/addon-knobs'

const def = story(
  'path-bar',
  (container) => {
    const { path, rootLabel } = createKnobs()

    const pathBar = new PathBar(container, {
      rootLabel,
      path,
    })

    pathBar.on('change', (path) => {
      console.log('Path changed:', path)
    })

    return pathBar
  },
  {
    readme,
    story: __STORY__,
    ReactComponent({ theme }) {
      const { path } = createKnobs()

      return (
        <LunaPathBar
          path={path}
          onChange={(path) => console.log('Path changed:', path)}
          theme={theme}
        />
      )
    },
  }
)

function createKnobs() {
  const rootLabel = text('Root Label', 'disk')
  const path = text('Initial Path', '/home/user')

  return {
    rootLabel,
    path,
  }
}

export default def

export const { pathBar: html, react } = def
