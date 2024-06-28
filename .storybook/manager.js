import { addons } from '@storybook/addons'
import theme from './theme'
import './style.css'

addons.setConfig({
  theme,
  panelPosition: 'right',
  enableShortcuts: false,
})
