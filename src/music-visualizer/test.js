import MusicVisualizer from './index'
import test from '../share/test'

test('music-visualizer', (container) => {
  const musicVisualizer = new MusicVisualizer(container, {
    audio: document.createElement('audio'),
  })

  it('basic', () => {
    musicVisualizer.setOption('image', '')
  })

  return musicVisualizer
})
