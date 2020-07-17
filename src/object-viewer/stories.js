import stringifyAll from 'licia/stringifyAll'
import 'object-viewer.css'
import ObjectViewer from 'object-viewer.js'

export default { title: 'Object Viewer' }

export const Object = () => {
  const container = document.createElement('div')
  const objectViewer = new ObjectViewer(container, {
    unenumerable: true,
    accessGetter: true
  })
  objectViewer.set(window)
  objectViewer.on('change', () => console.log('change'))

  return container
}

export const Static = () => {
  const container = document.createElement('div')

  const objectViewer = new ObjectViewer.Static(container)
  objectViewer.set(
    stringifyAll(window, {
      unenumerable: false
    })
  )
  objectViewer.on('change', () => console.log('change'))

  return container
}
