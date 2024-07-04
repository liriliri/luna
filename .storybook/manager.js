import { addons } from '@storybook/addons'
import theme from './theme'
import loadJs from 'licia/loadJs'
import './style.css'

addons.setConfig({
  theme,
  panelPosition: 'right',
  enableShortcuts: false,
})

loadJs(
  'https://www.googletagmanager.com/gtag/js?id=G-26RRF9531G',
  (isLoaded) => {
    if (isLoaded) {
      window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      gtag('config', 'G-26RRF9531G')
    }
  }
)
