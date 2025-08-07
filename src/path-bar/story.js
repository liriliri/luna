import 'luna-path-bar.css'
import PathBar from 'luna-path-bar.js'
import readme from './README.md'
import story from '../share/story'
import LunaPathBar from './react'

const def = story(
  'path-bar',
  (container) => {
    const pathBar = new PathBar(container, {
      path: '/home/user',
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
      return (
        <LunaPathBar
          path="/home/user"
          onChange={(path) => console.log('Path changed:', path)}
          theme={theme}
        />
      )
    },
  }
)

export default def

export const { pathBar: html, react } = def
